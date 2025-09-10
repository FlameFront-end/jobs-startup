import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, In, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm'
import { JobNormalizationService } from '../common/job-normalization.service'
import { CreateJobDto, JobQueryDto, JobResponseDto } from '../database/dto/job.dto'
import { MinimalJobDto, NormalizedJobDto } from '../database/dto/normalized-job.dto'
import { Job, ParsingLog } from '../database/entities'

@Injectable()
export class JobsService {
	private readonly logger = new Logger(JobsService.name)
	private readonly duplicateCache = new Set<string>()
	private cacheExpiry = 0
	private readonly CACHE_TTL = 5 * 60 * 1000 // 5 минут

	constructor(
		@InjectRepository(Job)
		private jobRepository: Repository<Job>,
		@InjectRepository(ParsingLog)
		private parsingLogRepository: Repository<ParsingLog>,
		private jobNormalizationService: JobNormalizationService
	) {}

	private parseDate(dateString: string): Date {
		const date = new Date(dateString)
		if (isNaN(date.getTime())) {
			throw new BadRequestException(`Некорректная дата: ${dateString}`)
		}
		return date
	}

	async create(createJobDto: CreateJobDto): Promise<JobResponseDto> {
		const job = this.jobRepository.create(createJobDto)
		const savedJob = await this.jobRepository.save(job)
		return savedJob as JobResponseDto
	}

	async findAll(query: JobQueryDto): Promise<{
		jobs: JobResponseDto[]
		total: number
		hasMore: boolean
	}> {
		const { source, sourceName, keywords, dateFrom, dateTo, limit = 20, offset = 0 } = query

		try {
			const where: any = {}

			if (source) {
				where.source = source
			}

			if (sourceName) {
				where.sourceName = Like(`%${sourceName}%`)
			}

			if (keywords && keywords.length > 0) {
				where.keywords = In(keywords)
			}
			if (dateFrom || dateTo) {
				const dateFromObj = dateFrom ? this.parseDate(dateFrom) : null
				const dateToObj = dateTo ? this.parseDate(dateTo) : null

				if (dateFromObj && dateToObj) {
					if (dateFromObj > dateToObj) {
						throw new BadRequestException('dateFrom не может быть больше dateTo')
					}
					where.publishedAt = Between(dateFromObj, dateToObj)
				} else if (dateFromObj) {
					where.publishedAt = MoreThanOrEqual(dateFromObj)
				} else if (dateToObj) {
					where.publishedAt = LessThanOrEqual(dateToObj)
				}
			}

			const [jobs, total] = await Promise.all([
				this.jobRepository.find({
					where,
					order: { publishedAt: 'DESC' },
					take: limit,
					skip: offset
				}),
				this.jobRepository.count({ where })
			])

			return {
				jobs: jobs as JobResponseDto[],
				total,
				hasMore: offset + limit < total
			}
		} catch (error) {
			this.logger.error('Error in findAll:', error)
			throw error
		}
	}

	async findOne(id: string): Promise<JobResponseDto | null> {
		const job = await this.jobRepository.findOne({ where: { id } })
		return job as JobResponseDto | null
	}

	async getNormalizedJobById(id: string): Promise<NormalizedJobDto | null> {
		const job = await this.jobRepository.findOne({
			where: {
				id,
				isNormalized: true
			}
		})

		if (!job || !job.normalizedData) {
			return null
		}

		return job.normalizedData as NormalizedJobDto
	}

	async getStats(days: number = 7): Promise<{
		totalJobs: number
		jobsBySource: { source: string; count: number }[]
		jobsByDay: { date: string; count: number }[]
	}> {
		const dateFrom = new Date()
		dateFrom.setDate(dateFrom.getDate() - days)

		try {
			const [totalJobs, jobsBySource, jobsByDay] = await Promise.all([
				this.jobRepository.count({
					where: { parsedAt: Between(dateFrom, new Date()) }
				}),
				this.jobRepository
					.createQueryBuilder('job')
					.select('job.source', 'source')
					.addSelect('COUNT(*)', 'count')
					.where('job.parsedAt >= :dateFrom', { dateFrom })
					.groupBy('job.source')
					.getRawMany(),
				this.jobRepository
					.createQueryBuilder('job')
					.select('DATE(job.parsedAt)', 'date')
					.addSelect('COUNT(*)', 'count')
					.where('job.parsedAt >= :dateFrom', { dateFrom })
					.groupBy('DATE(job.parsedAt)')
					.orderBy('date', 'DESC')
					.getRawMany()
			])

			return {
				totalJobs,
				jobsBySource: jobsBySource.map(item => ({
					source: item.source,
					count: parseInt(item.count)
				})),
				jobsByDay: jobsByDay.map(item => ({
					date: item.date,
					count: parseInt(item.count)
				}))
			}
		} catch (error) {
			this.logger.error('Error in getStats:', error)
			throw error
		}
	}

	async saveJob(jobData: CreateJobDto): Promise<boolean> {
		try {
			const existingJob = await this.jobRepository.findOne({
				where: { contentHash: jobData.contentHash },
				select: ['id', 'isNormalized']
			})

			if (existingJob) {
				if (existingJob.isNormalized) {
					return false
				} else {
					await this.jobRepository.delete(existingJob.id)
				}
			}

			const jobToSave = this.jobRepository.create({
				...jobData,
				isNormalized: false
			})

			const savedJob = await this.jobRepository.save(jobToSave)
			const normalizedJob = await this.jobNormalizationService.normalizeJob(jobData, savedJob.id)

			if (!normalizedJob) {
				await this.jobRepository.delete(savedJob.id)
				return false
			}

			await this.jobRepository.update(savedJob.id, {
				normalizedData: normalizedJob as any,
				qualityScore: normalizedJob.qualityScore,
				isNormalized: true
			})

			this.duplicateCache.add(jobData.contentHash)

			return true
		} catch (error) {
			this.logger.error('Error saving job:', error)
			return false
		}
	}

	async jobExists(contentHash: string): Promise<boolean> {
		const existingJob = await this.jobRepository.findOne({
			where: { contentHash },
			select: ['id']
		})
		return !!existingJob
	}

	async checkJobsExist(contentHashes: string[]): Promise<Set<string>> {
		if (contentHashes.length === 0) {
			return new Set()
		}

		const now = Date.now()
		if (now > this.cacheExpiry) {
			this.duplicateCache.clear()
			this.cacheExpiry = now + this.CACHE_TTL
		}

		const knownDuplicates = contentHashes.filter(hash => this.duplicateCache.has(hash))
		const unknownHashes = contentHashes.filter(hash => !this.duplicateCache.has(hash))

		if (unknownHashes.length === 0) {
			return new Set(knownDuplicates)
		}

		const existingJobs = await this.jobRepository.find({
			where: { contentHash: In(unknownHashes) },
			select: ['contentHash']
		})

		existingJobs.forEach(job => this.duplicateCache.add(job.contentHash))

		const allDuplicates = [...knownDuplicates, ...existingJobs.map(job => job.contentHash)]
		return new Set(allDuplicates)
	}

	async saveJobs(jobs: CreateJobDto[]): Promise<{ saved: number; skipped: number }> {
		if (jobs.length === 0) {
			return { saved: 0, skipped: 0 }
		}

		const contentHashes = jobs.map(job => job.contentHash)
		const existingJobs = await this.jobRepository.find({
			where: { contentHash: In(contentHashes) },
			select: ['contentHash']
		})

		const existingHashes = new Set(existingJobs.map(job => job.contentHash))
		const newJobs = jobs.filter(job => !existingHashes.has(job.contentHash))

		if (newJobs.length === 0) {
			return { saved: 0, skipped: jobs.length }
		}

		let saved = 0
		let skipped = 0

		for (const job of newJobs) {
			const wasSaved = await this.saveJob(job)
			if (wasSaved) {
				saved++
			} else {
				skipped++
			}
		}

		return { saved, skipped: skipped + existingHashes.size }
	}

	async deleteAllJobs(): Promise<{ deleted: number }> {
		try {
			const count = await this.jobRepository.count()
			await this.jobRepository.clear()
			return { deleted: count }
		} catch (error) {
			this.logger.error('Error deleting all jobs:', error)
			throw error
		}
	}

	async deleteJobsBySource(sourceName: string): Promise<{ deleted: number }> {
		try {
			const count = await this.jobRepository.count({ where: { sourceName } })

			if (count === 0) {
				return { deleted: 0 }
			}

			const result = await this.jobRepository
				.createQueryBuilder()
				.delete()
				.where('sourceName = :sourceName', { sourceName })
				.execute()

			return { deleted: result.affected || 0 }
		} catch (error) {
			this.logger.error(`Error deleting jobs from source ${sourceName}:`, error)
			throw error
		}
	}

	async getMinimalNormalizedJobs(query: JobQueryDto & { minQuality?: number }): Promise<{
		jobs: MinimalJobDto[]
		total: number
		hasMore: boolean
	}> {
		const { source, sourceName, keywords, dateFrom, dateTo, limit = 20, offset = 0, minQuality = 30 } = query

		try {
			const where: any = {
				isNormalized: true,
				qualityScore: MoreThanOrEqual(minQuality)
			}

			// Фильтр по источнику
			if (source) {
				where.source = source
			}

			// Фильтр по названию источника
			if (sourceName) {
				where.sourceName = Like(`%${sourceName}%`)
			}

			// Фильтр по ключевым словам
			if (keywords && keywords.length > 0) {
				where.keywords = In(keywords)
			}

			// Фильтр по датам
			if (dateFrom || dateTo) {
				const dateFromObj = dateFrom ? this.parseDate(dateFrom) : null
				const dateToObj = dateTo ? this.parseDate(dateTo) : null

				if (dateFromObj && dateToObj) {
					if (dateFromObj > dateToObj) {
						throw new BadRequestException('dateFrom не может быть больше dateTo')
					}
					where.publishedAt = Between(dateFromObj, dateToObj)
				} else if (dateFromObj) {
					where.publishedAt = MoreThanOrEqual(dateFromObj)
				} else if (dateToObj) {
					where.publishedAt = LessThanOrEqual(dateToObj)
				}
			}

			const [jobs, total] = await Promise.all([
				this.jobRepository.find({
					where,
					order: { qualityScore: 'DESC', publishedAt: 'DESC' },
					take: limit,
					skip: offset
				}),
				this.jobRepository.count({ where })
			])

			const minimalJobs = jobs
				.filter(job => job.normalizedData)
				.map(job => {
					const normalized = job.normalizedData as any
					return {
						id: job.id,
						title: normalized.title,
						shortDescription: normalized.shortDescription,
						companyName: normalized.company?.name || null,
						salaryMin: normalized.salary?.min || null,
						salaryMax: normalized.salary?.max || null,
						salaryCurrency: normalized.salary?.currency || null,
						city: normalized.location?.city || null,
						remote: normalized.location?.remote || false,
						workType: normalized.workType,
						experienceLevel: normalized.experienceLevel || null,
						source: job.source,
						sourceName: job.sourceName,
						originalUrl: job.originalUrl,
						publishedAt: job.publishedAt,
						qualityScore: job.qualityScore,
						technologies: normalized.requirements?.technical?.slice(0, 5) || []
					} as MinimalJobDto
				})

			return {
				jobs: minimalJobs,
				total,
				hasMore: offset + limit < total
			}
		} catch (error) {
			this.logger.error('Error in getMinimalNormalizedJobs:', error)
			throw error
		}
	}

	async getNormalizedJobs(query: JobQueryDto & { minQuality?: number }): Promise<{
		jobs: NormalizedJobDto[]
		total: number
		hasMore: boolean
	}> {
		const { source, sourceName, keywords, dateFrom, dateTo, limit = 20, offset = 0, minQuality = 30 } = query

		try {
			const where: any = {
				isNormalized: true,
				qualityScore: MoreThanOrEqual(minQuality)
			}

			if (source) {
				where.source = source
			}

			// Фильтр по  источника
			if (sourceName) {
				where.sourceName = Like(`%${sourceName}%`)
			}

			if (keywords && keywords.length > 0) {
				where.keywords = In(keywords)
			}

			if (dateFrom || dateTo) {
				const dateFromObj = dateFrom ? this.parseDate(dateFrom) : null
				const dateToObj = dateTo ? this.parseDate(dateTo) : null

				if (dateFromObj && dateToObj) {
					if (dateFromObj > dateToObj) {
						throw new BadRequestException('dateFrom не может быть больше dateTo')
					}
					where.publishedAt = Between(dateFromObj, dateToObj)
				} else if (dateFromObj) {
					where.publishedAt = MoreThanOrEqual(dateFromObj)
				} else if (dateToObj) {
					where.publishedAt = LessThanOrEqual(dateToObj)
				}
			}

			const [jobs, total] = await Promise.all([
				this.jobRepository.find({
					where,
					order: { qualityScore: 'DESC', publishedAt: 'DESC' },
					take: limit,
					skip: offset
				}),
				this.jobRepository.count({ where })
			])

			const normalizedJobs = jobs
				.filter(job => job.normalizedData)
				.map(job => job.normalizedData as NormalizedJobDto)

			return {
				jobs: normalizedJobs,
				total,
				hasMore: offset + limit < total
			}
		} catch (error) {
			this.logger.error('Error in getNormalizedJobs:', error)
			throw error
		}
	}

	async getQualityStats(): Promise<{
		totalJobs: number
		normalizedJobs: number
		averageQuality: number
		qualityDistribution: { range: string; count: number }[]
	}> {
		try {
			const [totalJobs, normalizedJobs, qualityStats] = await Promise.all([
				this.jobRepository.count(),
				this.jobRepository.count({ where: { isNormalized: true } }),
				this.jobRepository
					.createQueryBuilder('job')
					.select('AVG(job.qualityScore)', 'average')
					.addSelect('COUNT(*)', 'count')
					.where('job.isNormalized = true')
					.getRawOne(),
				this.jobRepository
					.createQueryBuilder('job')
					.select(
						'CASE ' +
							"WHEN job.qualityScore >= 90 THEN '90-100' " +
							"WHEN job.qualityScore >= 70 THEN '70-89' " +
							"WHEN job.qualityScore >= 50 THEN '50-69' " +
							"WHEN job.qualityScore >= 30 THEN '30-49' " +
							"ELSE '0-29' " +
							'END',
						'range'
					)
					.addSelect('COUNT(*)', 'count')
					.where('job.isNormalized = true')
					.groupBy('range')
					.getRawMany()
			])

			return {
				totalJobs,
				normalizedJobs,
				averageQuality: parseFloat(qualityStats?.average || '0'),
				qualityDistribution:
					qualityStats?.map(item => ({
						range: item.range,
						count: parseInt(item.count)
					})) || []
			}
		} catch (error) {
			this.logger.error('Error in getQualityStats:', error)
			throw error
		}
	}
}
