import { Controller, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ThrottlerGuard } from '@nestjs/throttler'
import { TelegramParserService } from './telegram-parser.service'

@ApiTags('telegram-parser')
@Controller('parsers/telegram')
@UseGuards(ThrottlerGuard)
export class TelegramParserController {
	constructor(private readonly telegramParserService: TelegramParserService) {}

	@Post('parse')
	@ApiOperation({ summary: 'Запустить парсинг Telegram каналов' })
	@ApiResponse({ status: 200, description: 'Парсинг Telegram запущен' })
	async parseTelegram() {
		const result = await this.telegramParserService.parseAllChannels()
		return {
			success: result.success,
			data: result
		}
	}
}
