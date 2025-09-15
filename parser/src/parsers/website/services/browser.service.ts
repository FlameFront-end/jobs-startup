import { Injectable, Logger } from '@nestjs/common'
import puppeteer, { Browser, Page } from 'puppeteer'

@Injectable()
export class BrowserService {
	private readonly logger = new Logger(BrowserService.name)
	private browser?: Browser

	async initBrowser(): Promise<void> {
		if (!this.browser || !this.browser.isConnected()) {
			if (this.browser) {
				await this.closeBrowser()
			}

			this.browser = await puppeteer.launch({
				headless: 'new',
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox',
					'--disable-dev-shm-usage',
					'--disable-gpu',
					'--no-first-run',
					'--disable-extensions',
					'--disable-plugins',
					'--disable-images',
					'--memory-pressure-off',
					'--max_old_space_size=4096'
				],
				executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/google-chrome-stable' : undefined,
				timeout: 60000
			})

			this.browser.on('disconnected', () => {
				this.logger.warn('Browser disconnected')
				this.browser = undefined
			})
		}
	}

	async createPage(): Promise<Page> {
		let attempts = 0
		const maxAttempts = 3

		while (attempts < maxAttempts) {
			try {
				await this.initBrowser()

				if (!this.browser || !this.browser.isConnected()) {
					this.logger.warn('Browser is not connected, reinitializing...')
					await this.closeBrowser()
					await this.initBrowser()
				}

				const page = await this.browser!.newPage()

				await page.setViewport({ width: 1920, height: 1080 })
				await page.setUserAgent(
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
				)

				page.on('error', error => {
					this.logger.error('Page error:', error)
				})

				page.on('pageerror', error => {
					this.logger.error('Page script error:', error)
				})

				return page
			} catch (error) {
				attempts++
				this.logger.error(`Failed to create page (attempt ${attempts}):`, error)

				if (attempts >= maxAttempts) {
					throw error
				}

				await this.closeBrowser()
				await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
			}
		}

		throw new Error('Failed to create page after all attempts')
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
