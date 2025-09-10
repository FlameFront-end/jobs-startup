import { Logger } from '@nestjs/common'
import { Page } from 'puppeteer'
import { TextProcessorService } from '../../../common/text-processor.service'
import { CreateJobDto, JobSource } from '../../../database/dto/job.dto'
import { ParserConfig } from '../config/parser-config'
import { ExtractedJobData } from '../services/html-extractor.service'

export abstract class BaseParser {
	protected readonly logger = new Logger(this.constructor.name)

	constructor(protected textProcessor: TextProcessorService) {}

	abstract parse(page: Page, config: ParserConfig): Promise<CreateJobDto[]>

	protected processJobData(jobData: ExtractedJobData, config: ParserConfig): CreateJobDto {
		const title = this.textProcessor.normalizeTitle(jobData.title)
		const description = this.textProcessor.normalizeDescription(jobData.description)
		const contentHash = this.textProcessor.createContentHash(title, description)
		const keywords = this.textProcessor.extractKeywords(`${title} ${description}`, config.keywords)

		// Добавляем информацию о компании в описание, если она есть
		let enhancedDescription = description
		if (jobData.company && jobData.company.name) {
			const companyInfo = []
			if (jobData.company.name) companyInfo.push(`Компания: ${jobData.company.name}`)
			if (jobData.company.size) companyInfo.push(`Размер: ${jobData.company.size}`)
			if (jobData.company.description) companyInfo.push(`Описание: ${jobData.company.description}`)
			if (jobData.company.website) companyInfo.push(`Сайт: ${jobData.company.website}`)

			enhancedDescription = `${companyInfo.join('. ')}. ${description}`
		}

		return {
			source: JobSource.WEBSITE,
			sourceName: config.name,
			title,
			description: enhancedDescription,
			originalUrl: jobData.originalUrl,
			publishedAt: new Date().toISOString(),
			contentHash,
			keywords
		}
	}

	protected async waitForContent(page: Page, selector: string, timeout = 15000): Promise<void> {
		await page.waitForSelector(selector, { timeout })
		await page.waitForTimeout(3000) // Дополнительное время для загрузки
	}

	protected async extractJobsFromPage(page: Page, config: ParserConfig): Promise<ExtractedJobData[]> {
		const jobElements = await page.evaluate(config => {
			const jobElements: any[] = []
			const vacancyContainers = document.querySelectorAll(config.selectors.container)

			vacancyContainers.forEach((container: any) => {
				// Поиск заголовка
				let title = ''
				for (const selector of config.selectors.title) {
					const titleEl = container.querySelector(selector)
					if (titleEl && titleEl.textContent?.trim()) {
						title = titleEl.textContent.trim()
						break
					}
				}

				if (title) {
					// Поиск ссылки
					let link = ''
					for (const selector of config.selectors.link) {
						const linkEl = container.querySelector(selector)
						if (linkEl && linkEl.getAttribute('href')) {
							link = linkEl.getAttribute('href')
							break
						}
					}

					// Поиск описания
					let description = ''
					for (const selector of config.selectors.description) {
						const descEl = container.querySelector(selector)
						if (descEl && descEl.textContent?.trim()) {
							description = descEl.textContent.trim()
							break
						}
					}

					// Если не нашли описание, берем весь текст контейнера
					if (!description) {
						description = container.textContent?.trim() || ''
						description = description.replace(/\s+/g, ' ').substring(0, 500)
					}

					if (description) {
						jobElements.push({
							title,
							description,
							originalUrl: link
								? link.startsWith('http')
									? link
									: `${config.baseUrl || ''}${link}`
								: undefined
						})
					}
				}
			})

			return jobElements
		}, config)

		return jobElements
	}
}
