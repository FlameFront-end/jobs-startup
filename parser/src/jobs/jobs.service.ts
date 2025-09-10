import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { CreateJobDto, JobQueryDto, JobResponseDto } from '../database/dto/job.dto'
import { MinimalJobDto, NormalizedJobDto } from '../database/dto/normalized-job.dto'
import { Job, ParsingLog } from '../database/entities'
import { JobCacheService } from './services/job-cache.service'
import { JobNormalizationService } from './services/job-normalization.service'
import { JobQueryBuilderService } from './services/job-query-builder.service'
import { JobStatsService } from './services/job-stats.service'

@Injectable()
export class JobsService {
	private readonly logger = new Logger(JobsService.name)

	constructor(
		@InjectRepository(Job)
		private jobRepository: Repository<Job>,
		@InjectRepository(ParsingLog)
		private parsingLogRepository: Repository<ParsingLog>,
		private jobCacheService: JobCacheService,
		private jobNormalizationService: JobNormalizationService,
		private jobQueryBuilder: JobQueryBuilderService,
		private jobStatsService: JobStatsService
	) {}

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
		const { limit = 20, offset = 0 } = query

		try {
			const where = this.jobQueryBuilder.buildWhereConditions(query)

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
		return this.jobNormalizationService.getNormalizedJobById(id)
	}

	async getStats(days: number = 7): Promise<{
		totalJobs: number
		jobsBySource: { source: string; count: number }[]
		jobsByDay: { date: string; count: number }[]
	}> {
		return this.jobStatsService.getBasicStats(days)
	}

	async saveJob(jobData: CreateJobDto): Promise<boolean> {
		const result = await this.jobNormalizationService.saveJobWithNormalization(jobData)
		if (result) {
			this.jobCacheService.addToCache(jobData.contentHash)
		}
		return result
	}

	async jobExists(contentHash: string): Promise<boolean> {
		return this.jobCacheService.jobExists(contentHash)
	}

	async checkJobsExist(contentHashes: string[]): Promise<Set<string>> {
		return this.jobCacheService.checkJobsExist(contentHashes)
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
		return this.jobNormalizationService.getMinimalNormalizedJobs(query)
	}

	async getNormalizedJobs(query: JobQueryDto & { minQuality?: number }): Promise<{
		jobs: NormalizedJobDto[]
		total: number
		hasMore: boolean
	}> {
		return this.jobNormalizationService.getNormalizedJobs(query)
	}

	async getQualityStats(): Promise<{
		totalJobs: number
		normalizedJobs: number
		averageQuality: number
		qualityDistribution: { range: string; count: number }[]
	}> {
		return this.jobStatsService.getQualityStats()
	}
}
