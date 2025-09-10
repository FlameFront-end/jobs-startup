import { BadRequestException, Injectable } from '@nestjs/common'
import { Between, In, LessThanOrEqual, Like, MoreThanOrEqual, SelectQueryBuilder } from 'typeorm'
import { JobQueryDto } from '../../database/dto/job.dto'
import { Job } from '../../database/entities'

@Injectable()
export class JobQueryBuilderService {
	private parseDate(dateString: string): Date {
		const date = new Date(dateString)
		if (isNaN(date.getTime())) {
			throw new BadRequestException(`Некорректная дата: ${dateString}`)
		}
		return date
	}

	buildWhereConditions(query: JobQueryDto, additionalConditions: Record<string, any> = {}): Record<string, any> {
		const { source, sourceName, keywords, dateFrom, dateTo } = query
		const where: any = { ...additionalConditions }

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

		return where
	}

	buildNormalizedJobWhereConditions(query: JobQueryDto & { minQuality?: number }): Record<string, any> {
		const { minQuality = 30 } = query
		return this.buildWhereConditions(query, {
			isNormalized: true,
			qualityScore: MoreThanOrEqual(minQuality)
		})
	}

	buildStatsQuery(queryBuilder: SelectQueryBuilder<Job>, dateFrom: Date): SelectQueryBuilder<Job> {
		return queryBuilder
			.select('job.source', 'source')
			.addSelect('COUNT(*)', 'count')
			.where('job.parsedAt >= :dateFrom', { dateFrom })
			.groupBy('job.source')
	}

	buildDailyStatsQuery(queryBuilder: SelectQueryBuilder<Job>, dateFrom: Date): SelectQueryBuilder<Job> {
		return queryBuilder
			.select('DATE(job.parsedAt)', 'date')
			.addSelect('COUNT(*)', 'count')
			.where('job.parsedAt >= :dateFrom', { dateFrom })
			.groupBy('DATE(job.parsedAt)')
			.orderBy('date', 'DESC')
	}

	buildQualityDistributionQuery(queryBuilder: SelectQueryBuilder<Job>): SelectQueryBuilder<Job> {
		return queryBuilder
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
	}
}
