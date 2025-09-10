import { Controller, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ThrottlerGuard } from '@nestjs/throttler'
import { WebsiteParserService } from './website-parser.service'

@ApiTags('website-parser')
@Controller('parsers/website')
@UseGuards(ThrottlerGuard)
export class WebsiteParserController {
	constructor(private readonly websiteParserService: WebsiteParserService) {}

	@Post('parse')
	@ApiOperation({ summary: 'Запустить парсинг веб-сайтов' })
	@ApiResponse({ status: 200, description: 'Парсинг веб-сайтов запущен' })
	async parseWebsites() {
		const result = await this.websiteParserService.parseAll()
		return {
			success: result.success,
			data: result
		}
	}
}
