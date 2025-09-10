import { Module } from '@nestjs/common'
import { JobsModule } from '../jobs/jobs.module'
import { ParsersModule } from '../parsers/parsers.module'
import { SchedulerService } from './scheduler.service'

@Module({
	imports: [ParsersModule, JobsModule],
	providers: [SchedulerService],
	exports: [SchedulerService]
})
export class SchedulerModule {}
