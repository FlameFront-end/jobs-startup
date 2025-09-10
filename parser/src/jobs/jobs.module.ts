import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharedModule } from '../common/shared.module'
import { Job, ParsingLog } from '../database/entities'
import { JobsController } from './jobs.controller'
import { JobsService } from './jobs.service'
import { JobCacheService } from './services/job-cache.service'
import { JobNormalizationService } from './services/job-normalization.service'
import { JobQueryBuilderService } from './services/job-query-builder.service'
import { JobStatsService } from './services/job-stats.service'

@Module({
	imports: [TypeOrmModule.forFeature([Job, ParsingLog]), SharedModule],
	controllers: [JobsController],
	providers: [JobsService, JobCacheService, JobNormalizationService, JobQueryBuilderService, JobStatsService],
	exports: [JobsService]
})
export class JobsModule {}
