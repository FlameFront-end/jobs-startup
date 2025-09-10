import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class HealthService {
	private readonly logger = new Logger(HealthService.name)

	constructor(
		@InjectDataSource()
		private dataSource: DataSource
	) {}

	async getHealthStatus(): Promise<{
		status: 'ok' | 'error'
		timestamp: string
		uptime: number
		database: {
			status: 'connected' | 'disconnected'
			responseTime?: number
		}
		memory: {
			used: number
			total: number
			percentage: number
		}
	}> {
		const startTime = Date.now()
		let databaseStatus: 'connected' | 'disconnected' = 'disconnected'
		let responseTime: number | undefined

		try {
			await this.dataSource.query('SELECT 1')
			databaseStatus = 'connected'
			responseTime = Date.now() - startTime
		} catch (error) {
			this.logger.error('Database health check failed:', error)
		}

		const memoryUsage = process.memoryUsage()
		const totalMemory = memoryUsage.heapTotal + memoryUsage.external
		const usedMemory = memoryUsage.heapUsed
		const memoryPercentage = (usedMemory / totalMemory) * 100

		return {
			status: databaseStatus === 'connected' ? 'ok' : 'error',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			database: {
				status: databaseStatus,
				responseTime
			},
			memory: {
				used: Math.round(usedMemory / 1024 / 1024), // MB
				total: Math.round(totalMemory / 1024 / 1024), // MB
				percentage: Math.round(memoryPercentage)
			}
		}
	}
}
