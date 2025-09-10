import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, Repository } from 'typeorm'
import { Job } from '../../database/entities'
import { JobQueryBuilderService } from './job-query-builder.service'

@Injectable()
export class JobStatsService {
	private readonly logger = new Logger(JobStatsService.name)

	constructor(
		@InjectRepository(Job)
		private jobRepository: Repository<Job>,
		private queryBuilder: JobQueryBuilderService
	) {}

	async getBasicStats(days: number = 7): Promise<{
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
				this.queryBuilder.buildStatsQuery(this.jobRepository.createQueryBuilder('job'), dateFrom).getRawMany(),
				this.queryBuilder
					.buildDailyStatsQuery(this.jobRepository.createQueryBuilder('job'), dateFrom)
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
			this.logger.error('Error in getBasicStats:', error)
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
			const [totalJobs, normalizedJobs, qualityStats, qualityDistribution] = await Promise.all([
				this.jobRepository.count(),
				this.jobRepository.count({ where: { isNormalized: true } }),
				this.jobRepository
					.createQueryBuilder('job')
					.select('AVG(job.qualityScore)', 'average')
					.addSelect('COUNT(*)', 'count')
					.where('job.isNormalized = true')
					.getRawOne(),
				this.queryBuilder
					.buildQualityDistributionQuery(this.jobRepository.createQueryBuilder('job'))
					.getRawMany()
			])

			return {
				totalJobs,
				normalizedJobs,
				averageQuality: parseFloat(qualityStats?.average || '0'),
				qualityDistribution: qualityDistribution.map(item => ({
					range: item.range,
					count: parseInt(item.count)
				}))
			}
		} catch (error) {
			this.logger.error('Error in getQualityStats:', error)
			throw error
		}
	}
}
