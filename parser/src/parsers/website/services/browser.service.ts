import { Injectable, Logger } from '@nestjs/common'
import puppeteer, { Browser, Page } from 'puppeteer'

@Injectable()
export class BrowserService {
	private readonly logger = new Logger(BrowserService.name)
	private browser?: Browser

	async initBrowser(): Promise<void> {
		if (!this.browser) {
			this.browser = await puppeteer.launch({
				headless: 'new',
				args: ['--no-sandbox', '--disable-setuid-sandbox']
			})
		}
	}

	async createPage(): Promise<Page> {
		await this.initBrowser()
		const page = this.browser!.newPage()
		return page
	}

	async closeBrowser(): Promise<void> {
		if (this.browser) {
			await this.browser.close()
			this.browser = undefined
		}
	}

	async onModuleDestroy() {
		await this.closeBrowser()
	}
}
