import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ThrottlerGuard } from '@nestjs/throttler'
import { JobsService } from '../jobs/jobs.service'

@ApiTags('stats')
@Controller('stats')
@UseGuards(ThrottlerGuard)
export class StatsController {
	constructor(private readonly jobsService: JobsService) {}

	@Get('parsing')
	@ApiOperation({ summary: 'Получить статистику парсинга' })
	@ApiQuery({
		name: 'days',
		required: false,
		description: 'Количество дней для статистики',
		type: Number
	})
	@ApiResponse({ status: 200, description: 'Статистика парсинга успешно получена' })
	async getParsingStats(@Query('days') days?: number) {
		const stats = await this.jobsService.getStats(days || 7)
		return {
			success: true,
			data: stats
		}
	}

	@Get('quality')
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
