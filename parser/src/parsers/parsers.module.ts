import { Module } from '@nestjs/common'
import { SharedModule } from '../common/shared.module'
import { JobsModule } from '../jobs/jobs.module'
import { TelegramParserController } from './telegram/telegram-parser.controller.js'
import { TelegramParserService } from './telegram/telegram-parser.service.js'
import { ParserFactory } from './website/factories/parser-factory.js'
import { HabrParser } from './website/parsers/habr-parser.js'
import { HHParser } from './website/parsers/hh-parser.js'
import { SuperJobParser } from './website/parsers/superjob-parser.js'
import { BrowserService } from './website/services/browser.service.js'
import { HtmlExtractorService } from './website/services/html-extractor.service.js'
import { WebsiteParserController } from './website/website-parser.controller.js'
import { WebsiteParserService } from './website/website-parser.service.js'

@Module({
	imports: [SharedModule, JobsModule],
	controllers: [WebsiteParserController, TelegramParserController],
	providers: [
		WebsiteParserService,
		TelegramParserService,
		BrowserService,
		HtmlExtractorService,
		ParserFactory,
		HHParser,
		SuperJobParser,
		HabrParser
	],
	exports: [WebsiteParserService, TelegramParserService]
})
export class ParsersModule {}
