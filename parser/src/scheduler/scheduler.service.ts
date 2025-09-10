import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { JobsService } from '../jobs/jobs.service'
import { TelegramParserService } from '../parsers/telegram/telegram-parser.service'
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

	@Cron(CronExpression.EVERY_5_MINUTES)
	async handleWebsiteParsing() {
		try {
			const result = await this.websiteParser.parseAll()
			this.logger.log(`🌐 Website parsing completed: ${result.jobsCount} jobs, Success: ${result.success}`)
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
