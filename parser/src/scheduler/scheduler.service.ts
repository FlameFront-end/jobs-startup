import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { JobsService } from '../jobs/jobs.service'
import { TelegramParserService } from '../parsers/telegram/telegram-parser.service'
import { ParserSite } from '../parsers/website/config/parser-config'
import { WebsiteParserService } from '../parsers/website/website-parser.service'

@Injectable()
export class SchedulerService {
	private readonly logger = new Logger(SchedulerService.name)

	constructor(
		private configService: ConfigService,
		private websiteParser: WebsiteParserService,
		private telegramParser: TelegramParserService,
		private jobsService: JobsService
	) {}

	@Cron(CronExpression.EVERY_30_MINUTES)
	async handleWebsiteParsing() {
		try {
			const targetSite = this.configService.get<string>('PARSER_TARGET_SITE', ParserSite.ALL) as ParserSite
			const validSite = Object.values(ParserSite).includes(targetSite) ? targetSite : ParserSite.ALL

			if (validSite !== targetSite) {
				this.logger.warn(`Invalid PARSER_TARGET_SITE: ${targetSite}, using default: ${ParserSite.ALL}`)
			}

			const result = await this.websiteParser.parseBySite(validSite)
			this.logger.log(
				`🌐 Website parsing completed for ${validSite}: ${result.jobsCount} jobs, Success: ${result.success}`
			)
		} catch (error) {
			this.logger.error('Error in website parsing:', error)
		}
	}

	@Cron(CronExpression.EVERY_10_MINUTES)
	async handleTelegramParsing() {
		try {
			const result = await this.telegramParser.parseAllChannels()
			this.logger.log(`📱 Telegram parsing completed: ${result.jobsCount} jobs, Success: ${result.success}`)
		} catch (error) {
			this.logger.error('Error in Telegram parsing:', error)
		}
	}
}
