import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { HealthService } from './health/health.service'

@ApiTags('health')
@Controller()
export class AppController {
	constructor(private readonly healthService: HealthService) {}

	@Get()
	@ApiOperation({ summary: 'Корневой эндпоинт' })
	@ApiResponse({ status: 200, description: 'Информация о сервисе' })
	getRoot() {
		return {
			success: true,
			message: 'Job Parser Service API',
			version: '1.0.0',
			timestamp: new Date().toISOString()
		}
	}

	@Get('health')
	@ApiOperation({ summary: 'Проверка состояния сервиса' })
	@ApiResponse({ status: 200, description: 'Состояние сервиса' })
	async getHealth() {
		const health = await this.healthService.getHealthStatus()
		return {
			success: true,
			data: health
		}
	}
}
