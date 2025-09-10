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

	protected processJobData(jobData: ExtractedJobData, config: ParserConfig): CreateJobDto | null {
		const title = this.textProcessor.normalizeTitle(jobData.title)
		const description = this.textProcessor.normalizeDescription(jobData.description)
		const contentHash = this.textProcessor.createContentHash(title, description)
		const keywords = this.textProcessor.extractKeywords(`${title} ${description}`, config.keywords)

		let publishedAt = new Date().toISOString()
		if (jobData.publishedAt && typeof jobData.publishedAt === 'string') {
			try {
				const parsedDate = this.parseDateText(jobData.publishedAt)
				if (parsedDate) {
					publishedAt = parsedDate
				}
			} catch (error) {
				this.logger.warn(`Ошибка парсинга даты "${jobData.publishedAt}": ${error.message}`)
			}
		}
		const publishedDate = new Date(publishedAt)
		const oneDayAgo = new Date()
		oneDayAgo.setDate(oneDayAgo.getDate() - 1)

		if (publishedDate < oneDayAgo) {
			this.logger.debug(`Пропускаем вакансию "${title}" - опубликована ${publishedAt} (старше 1 дня)`)
			return null
		}

		let enhancedDescription = description
		const additionalInfo = []

		if (jobData.company && jobData.company.name) {
			additionalInfo.push(`Компания: ${jobData.company.name}`)
			if (jobData.company.size) additionalInfo.push(`Размер: ${jobData.company.size}`)
			if (jobData.company.description) additionalInfo.push(`Описание: ${jobData.company.description}`)
			if (jobData.company.website) additionalInfo.push(`Сайт: ${jobData.company.website}`)
		}

		const salaryInfo = this.parseSalary(jobData.salary)
		if (salaryInfo) {
			const parsedSalary = this.parseSalaryDetails(salaryInfo)
			if (parsedSalary) {
				additionalInfo.push(`Зарплата: от ${parsedSalary.min} до ${parsedSalary.max} ${parsedSalary.currency}`)
			} else {
				additionalInfo.push(`Зарплата: ${salaryInfo}`)
			}
		}

		if (additionalInfo.length > 0) {
			enhancedDescription = `${additionalInfo.join('. ')}. ${description}`
		}

		return {
			source: JobSource.WEBSITE,
			sourceName: config.name,
			title,
			description: enhancedDescription,
			originalUrl: jobData.originalUrl,
			publishedAt,
			contentHash,
			keywords
		}
	}

	protected async waitForContent(page: Page, selector: string, timeout = 15000): Promise<void> {
		await page.waitForSelector(selector, { timeout })
		await page.waitForTimeout(3000)
	}

	protected parseDateText(dateText: string): string | undefined {
		if (!dateText || typeof dateText !== 'string') {
			this.logger.debug(`parseDateText получил невалидное значение: ${typeof dateText} - ${dateText}`)
			return undefined
		}

		const now = new Date()
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

		const dateTextLower = dateText.toLowerCase().trim()

		if (dateTextLower.includes('сегодня') || dateTextLower.includes('today')) {
			return today.toISOString()
		}

		if (dateTextLower.includes('вчера') || dateTextLower.includes('yesterday')) {
			const yesterday = new Date(today)
			yesterday.setDate(yesterday.getDate() - 1)
			return yesterday.toISOString()
		}
		const monthMatch = dateTextLower.match(
			/(\d{1,2})\s*(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря|янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)/i
		)
		if (monthMatch && monthMatch[1] && monthMatch[2]) {
			const day = parseInt(monthMatch[1])
			const monthName = monthMatch[2].toLowerCase()

			const monthMap: { [key: string]: number } = {
				января: 0,
				янв: 0,
				февраля: 1,
				фев: 1,
				марта: 2,
				мар: 2,
				апреля: 3,
				апр: 3,
				мая: 4,
				май: 4,
				июня: 5,
				июн: 5,
				июля: 6,
				июл: 6,
				августа: 7,
				авг: 7,
				сентября: 8,
				сен: 8,
				октября: 9,
				окт: 9,
				ноября: 10,
				ноя: 10,
				декабря: 11,
				дек: 11
			}

			const month = monthMap[monthName]
			if (month !== undefined) {
				const targetDate = new Date(today.getFullYear(), month, day)
				if (targetDate > today) {
					targetDate.setFullYear(targetDate.getFullYear() - 1)
				}
				return targetDate.toISOString()
			}
		}
		const daysAgoMatch = dateTextLower.match(/(\d+)\s*(дн|дня|дней|день|days?|day)\s*(назад|ago)/)
		if (daysAgoMatch) {
			const daysAgo = parseInt(daysAgoMatch[1])
			if (daysAgo <= 1) {
				const targetDate = new Date(today)
				targetDate.setDate(targetDate.getDate() - daysAgo)
				return targetDate.toISOString()
			}
		}

		const hoursAgoMatch = dateTextLower.match(/(\d+)\s*(час|часа|часов|ч|hours?|hrs?)\s*(назад|ago)/)
		if (hoursAgoMatch) {
			const hoursAgo = parseInt(hoursAgoMatch[1])
			if (hoursAgo <= 24) {
				const targetDate = new Date(now)
				targetDate.setHours(targetDate.getHours() - hoursAgo)
				return targetDate.toISOString()
			}
		}

		const minutesAgoMatch = dateTextLower.match(/(\d+)\s*(мин|минут|минуты|min|minutes?)\s*(назад|ago)/)
		if (minutesAgoMatch) {
			const minutesAgo = parseInt(minutesAgoMatch[1])
			if (minutesAgo <= 1440) {
				const targetDate = new Date(now)
				targetDate.setMinutes(targetDate.getMinutes() - minutesAgo)
				return targetDate.toISOString()
			}
		}
		try {
			const parsedDate = new Date(dateText)
			if (!isNaN(parsedDate.getTime())) {
				const oneDayAgo = new Date(now)
				oneDayAgo.setDate(oneDayAgo.getDate() - 1)

				if (parsedDate >= oneDayAgo) {
					return parsedDate.toISOString()
				}
			}
		} catch (error) {
			// Игнорируем ошибки парсинга
		}

		return undefined
	}

	protected parseSalary(salaryText: string | undefined): string | null {
		if (!salaryText || typeof salaryText !== 'string') {
			return null
		}

		const text = salaryText.trim()
		const cleanText = text.replace(/\s+/g, ' ').trim()
		if (
			cleanText.includes('$') ||
			cleanText.includes('₽') ||
			cleanText.includes('€') ||
			cleanText.match(/\d+.*\d+/) ||
			cleanText.match(/от\s*\d+|до\s*\d+/)
		) {
			return cleanText
		}

		return null
	}

	protected parseSalaryDetails(salaryText: string): { min: number; max: number; currency: string } | null {
		if (!salaryText || typeof salaryText !== 'string') {
			return null
		}

		const text = salaryText.trim()

		const patterns = [
			/от\s*(\d+)\s*до\s*(\d+)\s*\$/.exec(text),
			/(\d+)\s*-\s*(\d+)\s*\$/.exec(text),
			/от\s*(\d+)\s*до\s*(\d+)\s*долларов/.exec(text),
			/(\d+)\s*-\s*(\d+)\s*долларов/.exec(text),
			/от\s*(\d+)\s*до\s*(\d+)\s*₽/.exec(text),
			/(\d+)\s*-\s*(\d+)\s*₽/.exec(text),
			/от\s*(\d+)\s*до\s*(\d+)\s*руб/.exec(text),
			/(\d+)\s*-\s*(\d+)\s*руб/.exec(text)
		]

		for (const match of patterns) {
			if (match && match[1] && match[2]) {
				const min = parseInt(match[1])
				const max = parseInt(match[2])
				let currency = 'RUB'

				if (text.includes('$') || text.includes('долларов')) {
					currency = 'USD'
				} else if (text.includes('€') || text.includes('евро')) {
					currency = 'EUR'
				}

				return { min, max, currency }
			}
		}

		return null
	}

	protected async extractJobsFromPage(page: Page, config: ParserConfig): Promise<ExtractedJobData[]> {
		const jobElements = await page.evaluate(config => {
			const jobElements: any[] = []
			const vacancyContainers = document.querySelectorAll(config.selectors.container)

			vacancyContainers.forEach((container: any) => {
				let title = ''
				for (const selector of config.selectors.title) {
					const titleEl = container.querySelector(selector)
					if (titleEl && titleEl.textContent?.trim()) {
						title = titleEl.textContent.trim()
						break
					}
				}

				if (title) {
					let link = ''
					for (const selector of config.selectors.link) {
						const linkEl = container.querySelector(selector)
						if (linkEl && linkEl.getAttribute('href')) {
							link = linkEl.getAttribute('href')
							break
						}
					}

					let description = ''
					for (const selector of config.selectors.description) {
						const descEl = container.querySelector(selector)
						if (descEl && descEl.textContent?.trim()) {
							description = descEl.textContent.trim()
							break
						}
					}

					if (!description) {
						description = container.textContent?.trim() || ''
						description = description.replace(/\s+/g, ' ').substring(0, 500)
					}

					let publishedAt = undefined
					if (config.selectors.date) {
						for (const selector of config.selectors.date) {
							const dateEl = container.querySelector(selector)
							if (dateEl && dateEl.textContent?.trim()) {
								publishedAt = dateEl.textContent.trim()
								break
							}
						}
					}

					if (description) {
						jobElements.push({
							title,
							description,
							originalUrl: link
								? link.startsWith('http')
									? link
									: `${config.baseUrl || ''}${link}`
								: undefined,
							publishedAt
						})
					}
				}
			})

			return jobElements
		}, config)

		return jobElements
	}
}
