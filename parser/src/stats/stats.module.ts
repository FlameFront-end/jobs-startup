import { Module } from '@nestjs/common'
import { JobsModule } from '../jobs/jobs.module'
import { StatsController } from './stats.controller'

@Module({
	imports: [JobsModule],
	controllers: [StatsController]
})
export class StatsModule {}
