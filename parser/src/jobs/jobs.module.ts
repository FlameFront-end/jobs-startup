import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharedModule } from '../common/shared.module'
import { Job, ParsingLog } from '../database/entities'
import { JobsController } from './jobs.controller'
import { JobsService } from './jobs.service'

@Module({
	imports: [TypeOrmModule.forFeature([Job, ParsingLog]), SharedModule],
	controllers: [JobsController],
	providers: [JobsService],
	exports: [JobsService]
})
export class JobsModule {}
