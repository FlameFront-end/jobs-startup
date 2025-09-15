import { Module } from '@nestjs/common'
import { SharedModule } from '../common/shared.module'
import { JobsModule } from '../jobs/jobs.module'
import { TelegramParserController } from './telegram/telegram-parser.controller'
import { TelegramParserService } from './telegram/telegram-parser.service'
import { ParserFactory } from './website/factories/parser-factory'
import { HabrParser } from './website/parsers/habr-parser'
import { HHParser } from './website/parsers/hh-parser'
import { SuperJobParser } from './website/parsers/superjob-parser'
import { BrowserService } from './website/services/browser.service'
import { HtmlExtractorService } from './website/services/html-extractor.service'
import { WebsiteParserController } from './website/website-parser.controller'
import { WebsiteParserService } from './website/website-parser.service'

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
