import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ThrottlerGuard } from '@nestjs/throttler'
import { ParserSite } from './config/parser-config'
import { WebsiteParserService } from './website-parser.service'

@ApiTags('website-parser')
@Controller('parsers/website')
@UseGuards(ThrottlerGuard)
export class WebsiteParserController {
	constructor(private readonly websiteParserService: WebsiteParserService) {}

	@Post('parse')
	@ApiOperation({ summary: 'Запустить парсинг веб-сайтов' })
	@ApiQuery({
		name: 'site',
		required: false,
		description: 'Конкретный сайт для парсинга (если не указан - парсит все сайты)',
		enum: ParserSite,
		example: 'hh.ru'
	})
	@ApiResponse({ status: 200, description: 'Парсинг ываыва веб-сайтов запущен' })
	@ApiResponse({ status: 400, description: 'Некорректное название сайта' })
	async parseWebsites(@Query('site') site?: ParserSite) {
		// Если сайт указан, валидируем его
		if (site && !Object.values(ParserSite).includes(site)) {
			return {
				success: false,
				error: `Некорректное название сайта: ${site}. Доступные сайты: ${Object.values(ParserSite).join(', ')}`
			}
		}

		// Парсим конкретный сайт или все сайты
		const result = site
			? await this.websiteParserService.parseBySite(site)
			: await this.websiteParserService.parseAll()

		return {
			success: result.success,
			data: result
		}
	}

	@Get('sites')
	@ApiOperation({ summary: 'Получить список доступных сайтов для парсинга' })
	@ApiResponse({ status: 200, description: 'Список сайтов успешно получен' })
	async getAvailableSites() {
		// Test hot reload
		const sites = this.websiteParserService.getAvailableSites()
		return {
			success: true,
			data: sites
		}
	}
}
