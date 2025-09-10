import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ThrottlerGuard } from '@nestjs/throttler'
import { CreateJobDto, JobQueryDto, JobResponseDto } from '../database/dto/job.dto'
import { NormalizedJobDto } from '../database/dto/normalized-job.dto'
import { JobsService } from './jobs.service'

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(ThrottlerGuard)
export class JobsController {
	constructor(private readonly jobsService: JobsService) {}

	@Post()
	@ApiOperation({ summary: 'Создать новую вакансию' })
	@ApiResponse({ status: 201, description: 'Вакансия успешно создана', type: JobResponseDto })
	@ApiResponse({ status: 400, description: 'Ошибка валидации' })
	async create(@Body() createJobDto: CreateJobDto): Promise<JobResponseDto> {
		return this.jobsService.create(createJobDto)
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
	@ApiResponse({ status: 200, description: 'Список вакансий успешно получен' })
	async findAll(@Query() query: JobQueryDto) {
		const result = await this.jobsService.findAll(query)
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

	@Get('stats')
	@ApiOperation({ summary: 'Получить статистику парсинга' })
	@ApiQuery({
		name: 'days',
		required: false,
		description: 'Количество дней для статистики',
		type: Number
	})
	@ApiResponse({ status: 200, description: 'Статистика успешно получена' })
	async getStats(@Query('days') days?: number) {
		const stats = await this.jobsService.getStats(days || 7)
		return {
			success: true,
			data: stats
		}
	}

	@Get(':id')
	@ApiOperation({ summary: 'Получить вакансию по ID' })
	@ApiParam({ name: 'id', description: 'ID вакансии' })
	@ApiResponse({ status: 200, description: 'Вакансия успешно найдена', type: JobResponseDto })
	@ApiResponse({ status: 404, description: 'Вакансия не найдена' })
	async findOne(@Param('id') id: string) {
		const job = await this.jobsService.findOne(id)
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

	@Delete('source/:sourceName')
	@ApiOperation({ summary: 'Удалить все вакансии из определенного источника' })
	@ApiParam({
		name: 'sourceName',
		description: 'Название источника (HH.ru, SuperJob, Habr Career)'
	})
	@ApiResponse({ status: 200, description: 'Вакансии источника успешно удалены' })
	@ApiResponse({ status: 500, description: 'Ошибка при удалении вакансий' })
	async deleteBySource(@Param('sourceName') sourceName: string) {
		try {
			const result = await this.jobsService.deleteJobsBySource(sourceName)
			return {
				success: true,
				message: `Удалено ${result.deleted} вакансий из источника ${sourceName}`,
				deleted: result.deleted,
				sourceName
			}
		} catch (error) {
			return {
				success: false,
				error: `Ошибка при удалении вакансий из источника ${sourceName}`,
				details: error.message
			}
		}
	}

	@Get('normalized')
	@ApiOperation({ summary: 'Получить нормализованные вакансии' })
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
	@ApiResponse({ status: 200, description: 'Нормализованные вакансии успешно получены', type: [NormalizedJobDto] })
	async getNormalizedJobs(@Query() query: JobQueryDto & { minQuality?: number }) {
		const result = await this.jobsService.getNormalizedJobs(query)
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

	@Get('quality/stats')
	@ApiOperation({ summary: 'Получить статистику качества данных' })
	@ApiResponse({ status: 200, description: 'Статистика качества успешно получена' })
	async getQualityStats() {
		const stats = await this.jobsService.getQualityStats()
		return {
			success: true,
			data: stats
		}
	}
}
