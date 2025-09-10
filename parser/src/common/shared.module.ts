import { Module } from '@nestjs/common'
import { AIService } from './ai-service'
import { JobNormalizationService } from './job-normalization.service'
import { TextProcessorService } from './text-processor.service'

@Module({
	providers: [TextProcessorService, AIService, JobNormalizationService],
	exports: [TextProcessorService, AIService, JobNormalizationService]
})
export class SharedModule {}
