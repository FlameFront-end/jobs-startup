import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JobNormalizationService as CommonJobNormalizationService } from '../../common/job-normalization.service'
import { CreateJobDto } from '../../database/dto/job.dto'
import { MinimalJobDto, NormalizedJobDto } from '../../database/dto/normalized-job.dto'
import { Job } from '../../database/entities'
import { JobQueryBuilderService } from './job-query-builder.service'

@Injectable()
export class JobNormalizationService {
	private readonly logger = new Logger(JobNormalizationService.name)

	constructor(
		@InjectRepository(Job)
		private jobRepository: Repository<Job>,
		private commonJobNormalizationService: CommonJobNormalizationService,
		private queryBuilder: JobQueryBuilderService
	) {}

	async getNormalizedJobById(id: string): Promise<NormalizedJobDto | null> {
		try {
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
		} catch (error) {
			this.logger.error('Error getting normalized job by ID:', error)
			return null
		}
	}

	async getMinimalNormalizedJobs(query: any): Promise<{
		jobs: MinimalJobDto[]
		total: number
		hasMore: boolean
	}> {
		const { limit = 20, offset = 0 } = query

		try {
			const where = this.queryBuilder.buildNormalizedJobWhereConditions(query)

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

	async getNormalizedJobs(query: any): Promise<{
		jobs: NormalizedJobDto[]
		total: number
		hasMore: boolean
	}> {
		const { limit = 20, offset = 0 } = query

		try {
			const where = this.queryBuilder.buildNormalizedJobWhereConditions(query)

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

	async saveJobWithNormalization(jobData: CreateJobDto): Promise<boolean> {
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
			const normalizedJob = await this.commonJobNormalizationService.normalizeJob(jobData, savedJob.id)

			if (!normalizedJob) {
				await this.jobRepository.delete(savedJob.id)
				return false
			}

			await this.jobRepository.update(savedJob.id, {
				normalizedData: normalizedJob as any,
				qualityScore: normalizedJob.qualityScore,
				isNormalized: true
			})

			return true
		} catch (error) {
			this.logger.error('Error saving job with normalization:', error)
			return false
		}
	}
}
