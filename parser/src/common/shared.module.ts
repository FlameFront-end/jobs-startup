import { Module } from '@nestjs/common'
import { TextProcessorService } from './text-processor.service'

@Module({
	providers: [TextProcessorService],
	exports: [TextProcessorService]
})
export class SharedModule {}
