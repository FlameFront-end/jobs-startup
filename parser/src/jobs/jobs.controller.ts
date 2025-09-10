import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ThrottlerGuard } from '@nestjs/throttler'
import { JobQueryDto } from '../database/dto/job.dto'
import { MinimalJobDto, NormalizedJobDto } from '../database/dto/normalized-job.dto'
import { JobsService } from './jobs.service'

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(ThrottlerGuard)
export class JobsController {
	constructor(private readonly jobsService: JobsService) {}

	@Get(':id')
	@ApiOperation({ summary: 'Получить полную вакансию по ID' })
	@ApiParam({ name: 'id', description: 'ID вакансии' })
	@ApiResponse({ status: 200, description: 'Вакансия успешно найдена', type: NormalizedJobDto })
	@ApiResponse({ status: 404, description: 'Вакансия не найдена' })
	async getJobById(@Param('id') id: string) {
		const job = await this.jobsService.getNormalizedJobById(id)
		if (!job) {
			return {
				success: false,
				error: 'Job not found'
			}
		}
		return {
			success: true,
			data: job
		}
	}

	@Delete()
	@ApiOperation({ summary: 'Удалить все вакансии из базы данных' })
	@ApiResponse({ status: 200, description: 'Все вакансии успешно удалены' })
	@ApiResponse({ status: 500, description: 'Ошибка при удалении вакансий' })
	async deleteAll() {
		try {
			const result = await this.jobsService.deleteAllJobs()
			return {
				success: true,
				message: `Удалено ${result.deleted} вакансий`,
				deleted: result.deleted
			}
		} catch (error) {
			return {
				success: false,
				error: 'Ошибка при удалении вакансий',
				details: error.message
			}
		}
	}

	@Get()
	@ApiOperation({ summary: 'Получить список вакансий' })
	@ApiQuery({ name: 'source', required: false, description: 'Фильтр по источнику' })
	@ApiQuery({ name: 'sourceName', required: false, description: 'Фильтр по названию источника' })
	@ApiQuery({
		name: 'keywords',
		required: false,
		description: 'Фильтр по ключевым словам',
		type: [String]
	})
	@ApiQuery({ name: 'dateFrom', required: false, description: 'Дата начала периода' })
	@ApiQuery({ name: 'dateTo', required: false, description: 'Дата окончания периода' })
	@ApiQuery({
		name: 'limit',
		required: false,
		description: 'Количество записей на страницу',
		type: Number
	})
	@ApiQuery({
		name: 'offset',
		required: false,
		description: 'Смещение для пагинации',
		type: Number
	})
	@ApiQuery({
		name: 'minQuality',
		required: false,
		description: 'Минимальное качество данных (0-100)',
		type: Number
	})
	@ApiResponse({
		status: 200,
		description: 'Список вакансий успешно получен',
		type: [MinimalJobDto]
	})
	async getJobs(@Query() query: JobQueryDto & { minQuality?: number }) {
		const result = await this.jobsService.getMinimalNormalizedJobs(query)
		return {
			success: true,
			data: result.jobs,
			pagination: {
				total: result.total,
				limit: query.limit || 20,
				offset: query.offset || 0,
				hasMore: result.hasMore
			}
		}
	}
}
