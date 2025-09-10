import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'

import { AppController } from './app.controller'
import { SharedModule } from './common/shared.module'
import { DatabaseModule } from './database/database.module'
import { HealthService } from './health/health.service'
import { JobsModule } from './jobs/jobs.module'
import { ParsersModule } from './parsers/parsers.module'
import { SchedulerModule } from './scheduler/scheduler.module'
import { StatsModule } from './stats/stats.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env'
		}),
		WinstonModule.forRoot({
			level: 'debug',
			transports: [
				new winston.transports.Console({
					level: 'debug',
					format: winston.format.combine(
						winston.format.timestamp(),
						winston.format.colorize(),
						winston.format.simple()
					)
				}),
				new winston.transports.File({
					filename: 'logs/error.log',
					level: 'error',
					format: winston.format.combine(winston.format.timestamp(), winston.format.json())
				}),
				new winston.transports.File({
					filename: 'logs/combined.log',
					level: 'debug',
					format: winston.format.combine(winston.format.timestamp(), winston.format.json())
				})
			]
		}),
		ThrottlerModule.forRoot([
			{
				ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
				limit: parseInt(process.env.THROTTLE_LIMIT || '100')
			}
		]),
		ScheduleModule.forRoot(),
		DatabaseModule,
		SharedModule,
		JobsModule,
		ParsersModule,
		SchedulerModule,
		StatsModule
	],
	controllers: [AppController],
	providers: [HealthService]
})
export class AppModule {}
