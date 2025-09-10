import { Injectable } from '@nestjs/common'
import { TextProcessorService } from '../../../common/text-processor.service'
import { ParserConfig } from '../config/parser-config'
import { BaseParser } from '../parsers/base-parser'
import { HabrParser } from '../parsers/habr-parser'
import { HHParser } from '../parsers/hh-parser'
import { SuperJobParser } from '../parsers/superjob-parser'
import { HtmlExtractorService } from '../services/html-extractor.service'

@Injectable()
export class ParserFactory {
	constructor(
		private textProcessor: TextProcessorService,
		private htmlExtractor: HtmlExtractorService
	) {}

	createParser(config: ParserConfig): BaseParser {
		switch (config.name) {
			case 'HH.ru':
				return new HHParser(this.textProcessor)
			case 'SuperJob':
				return new SuperJobParser(this.textProcessor)
			case 'Habr Career':
				return new HabrParser(this.textProcessor, this.htmlExtractor)
			default:
				throw new Error(`Unknown parser: ${config.name}`)
		}
	}
}
