import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, In, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm'
import { CreateJobDto, JobQueryDto, JobResponseDto } from '../database/dto/job.dto'
import { Job, ParsingLog } from '../database/entities'

@Injectable()
export class JobsService {
	private readonly logger = new Logger(JobsService.name)

	constructor(
		@InjectRepository(Job)
		private jobRepository: Repository<Job>,
		@InjectRepository(ParsingLog)
		private parsingLogRepository: Repository<ParsingLog>
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

			// Фильтр по источнику
			if (source) {
				where.source = source
			}

			// Фильтр по названию источника
			if (sourceName) {
				where.sourceName = Like(`%${sourceName}%`)
			}

			// Фильтр по ключевым словам - ищем пересечение массивов
			if (keywords && keywords.length > 0) {
				where.keywords = In(keywords)
			}

			// Фильтр по датам с валидацией
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
			// Проверяем, существует ли уже такая вакансия
			const existingJob = await this.jobRepository.findOne({
				where: { contentHash: jobData.contentHash }
			})

			if (existingJob) {
				return false
			}

			await this.jobRepository.save(jobData)
			return true
		} catch (error) {
			this.logger.error('Error saving job:', error)
			return false
		}
	}

	async saveJobs(jobs: CreateJobDto[]): Promise<{ saved: number; skipped: number }> {
		let saved = 0
		let skipped = 0

		for (const job of jobs) {
			const wasSaved = await this.saveJob(job)
			if (wasSaved) {
				saved++
			} else {
				skipped++
			}
		}

		return { saved, skipped }
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
}
