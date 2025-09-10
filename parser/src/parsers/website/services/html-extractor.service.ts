import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { ParserConfig } from '../config/parser-config'

export interface ExtractedJobData {
	title: string
	description: string
	originalUrl?: string
	publishedAt?: string
	salary?: string
	company?: {
		name: string
		size?: string | null
		description?: string | null
		website?: string | null
	}
}

@Injectable()
export class HtmlExtractorService {
	private readonly logger = new Logger(HtmlExtractorService.name)

	async fetchPage(url: string): Promise<string> {
		const response = await axios.get(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
				'Accept-Encoding': 'gzip, deflate, br',
				DNT: '1',
				Connection: 'keep-alive',
				'Upgrade-Insecure-Requests': '1'
			},
			timeout: 10000
		})
		return response.data
	}

	extractJobsFromHtml(html: string, config: ParserConfig): ExtractedJobData[] {
		const $ = cheerio.load(html)
		const jobs: ExtractedJobData[] = []

		$(config.selectors.container).each((_, element) => {
			const $el = $(element)
			const job = this.extractJobFromElement($el, config)
			if (job) jobs.push(job)
		})

		return jobs
	}

	private extractJobFromElement($el: cheerio.Cheerio<any>, config: ParserConfig): ExtractedJobData | null {
		const title = this.findTextBySelectors($el, config.selectors.title)
		const description = this.findTextBySelectors($el, config.selectors.description)
		const link = this.findAttributeBySelectors($el, config.selectors.link, 'href')
		const publishedAt = this.extractPublishedDate($el, config)

		if (!title) return null

		const originalUrl = link ? this.normalizeUrl(link, config.baseUrl) : undefined

		return {
			title: title.trim(),
			description: description ? description.trim() : '',
			originalUrl,
			publishedAt
		}
	}

	private findTextBySelectors($el: cheerio.Cheerio<any>, selectors: string[]): string {
		for (const selector of selectors) {
			const element = $el.find(selector)
			if (element.length && element.text().trim()) {
				return element.text().trim()
			}
		}
		return ''
	}

	private findAttributeBySelectors($el: cheerio.Cheerio<any>, selectors: string[], attribute: string): string {
		for (const selector of selectors) {
			const element = $el.find(selector)
			if (element.length && element.attr(attribute)) {
				return element.attr(attribute)!
			}
		}
		return ''
	}

	private normalizeUrl(url: string, baseUrl?: string): string {
		if (url.startsWith('http')) {
			return url
		}
		return baseUrl ? `${baseUrl}${url}` : url
	}

	async getFullJobDescription(url: string): Promise<{ description: string; salary?: string; publishedAt?: string }> {
		try {
			const html = await this.fetchPage(url)
			const $ = cheerio.load(html)

			// Извлекаем зарплату из специальных блоков или JSON-LD
			let salary = ''

			// 1. Сначала ищем в блоке с заголовком "Зарплата"
			const salarySection = $('.content-section').filter(function () {
				const title = $(this).find('.content-section__title').text().trim().toLowerCase()
				return title.includes('зарплата')
			})

			if (salarySection.length > 0) {
				// Ищем зарплату внутри найденного блока
				const salaryEl = salarySection.find('.basic-salary, .vacancy-header__salary, [class*="salary"]')
				if (salaryEl.length && salaryEl.text().trim()) {
					const salaryText = salaryEl.text().trim()
					// Проверяем, что это действительно зарплата (содержит цифры и валюту)
					if (salaryText.match(/\d+.*[\$₽€]|[\$₽€].*\d+/) || salaryText.match(/\d+.*(руб|долларов|евро)/)) {
						salary = salaryText
					}
				}
			}

			// 2. Если не нашли в блоке, ищем в JSON-LD структуре
			if (!salary) {
				const jsonLdScripts = $('script[type="application/ld+json"]')
				jsonLdScripts.each(function () {
					try {
						const jsonData = JSON.parse($(this).html())
						if (jsonData['@type'] === 'JobPosting' && jsonData.baseSalary) {
							const baseSalary = jsonData.baseSalary
							if (baseSalary.value && baseSalary.value.minValue && baseSalary.value.maxValue) {
								const currency = baseSalary.currency || 'USD'
								const minValue = baseSalary.value.minValue
								const maxValue = baseSalary.value.maxValue
								salary = `от ${minValue} до ${maxValue} ${currency}`
							}
						}
					} catch (e) {
						// Игнорируем ошибки парсинга JSON
					}
				})
			}

			// Извлекаем дату публикации
			let publishedAt = ''
			const dateSelectors = ['.vacancy-date', '.published-date', '.date', '[class*="date"]', '.vacancy-published']

			for (const selector of dateSelectors) {
				const dateEl = $(selector)
				if (dateEl.length && dateEl.text().trim()) {
					publishedAt = dateEl.text().trim()
					break
				}
			}

			// Если не нашли дату в специальных селекторах, ищем в тексте
			if (!publishedAt) {
				const bodyText = $('body').text()
				const dateMatch = bodyText.match(
					/(\d{1,2}\s*(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)|8\s*сентября)/i
				)
				if (dateMatch) {
					publishedAt = dateMatch[0].trim()
				}
			}

			// Ищем основное описание вакансии
			const mainDescSelectors = [
				'.vacancy-description__text .style-ugc',
				'.vacancy-description__text',
				'.vacancy-description',
				'[data-qa="vacancy-description"]',
				'.vacancy-section__content',
				'.vacancy__description',
				'.job-description'
			]

			let description = ''
			for (const selector of mainDescSelectors) {
				const descEl = $(selector)
				if (descEl.length && descEl.text().trim()) {
					description = descEl.text().trim()
					break
				}
			}

			// Fallback селекторы
			if (!description) {
				const fallbackSelectors = [
					'.vacancy__body',
					'.vacancy-content',
					'.job-content',
					'.vacancy-text',
					'main .content',
					'.vacancy__main'
				]

				for (const selector of fallbackSelectors) {
					const descEl = $(selector)
					if (descEl.length && descEl.text().trim()) {
						description = descEl.text().trim()
						break
					}
				}
			}

			// Если все еще не нашли, берем весь контент страницы и фильтруем
			if (!description) {
				const bodyText = $('body').text()
				const lines = bodyText
					.split('\n')
					.map(line => line.trim())
					.filter(line => line.length > 0)

				// Ищем начало описания
				let startIndex = -1
				for (let i = 0; i < lines.length; i++) {
					if (
						lines[i].includes('О компании') ||
						lines[i].includes('Обязанности') ||
						lines[i].includes('Требования') ||
						lines[i].includes('Условия работы')
					) {
						startIndex = i
						break
					}
				}

				if (startIndex >= 0) {
					const relevantLines = lines.slice(startIndex)
					description = this.cleanDescription(relevantLines.join(' ').substring(0, 3000))
				} else {
					description = 'Описание не найдено'
				}
			} else {
				description = this.cleanDescription(description)
			}

			return {
				description,
				salary: salary || undefined,
				publishedAt: publishedAt || undefined
			}
		} catch (error) {
			this.logger.error(`Error fetching job description from ${url}:`, error.message)
			throw error
		}
	}

	private extractPublishedDate($el: cheerio.Cheerio<any>, config: ParserConfig): string | undefined {
		// Ищем дату по селекторам из конфигурации
		if (config.selectors.date) {
			const dateText = this.findTextBySelectors($el, config.selectors.date)
			if (dateText) {
				return this.parseDateText(dateText)
			}
		}

		// Fallback: ищем дату по общим селекторам
		const commonDateSelectors = [
			'[data-qa="vacancy-serp__vacancy-date"]',
			'.vacancy-serp__vacancy-date',
			'.vacancy-card__date',
			'.date',
			'.published-date',
			'.vacancy-date',
			'[data-qa="vacancy-date"]',
			'.job-date',
			'.posting-date'
		]

		for (const selector of commonDateSelectors) {
			const dateEl = $el.find(selector)
			if (dateEl.length && dateEl.text().trim()) {
				const dateText = dateEl.text().trim()
				const parsedDate = this.parseDateText(dateText)
				if (parsedDate) return parsedDate
			}
		}

		return undefined
	}

	private parseDateText(dateText: string): string | undefined {
		if (!dateText || typeof dateText !== 'string') {
			return undefined
		}

		const now = new Date()
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

		// Обрабатываем различные форматы дат
		const dateTextLower = dateText.toLowerCase().trim()

		// "сегодня", "today"
		if (dateTextLower.includes('сегодня') || dateTextLower.includes('today')) {
			return today.toISOString()
		}

		// "вчера", "yesterday"
		if (dateTextLower.includes('вчера') || dateTextLower.includes('yesterday')) {
			const yesterday = new Date(today)
			yesterday.setDate(yesterday.getDate() - 1)
			return yesterday.toISOString()
		}

		// "X дней назад", "X days ago"
		const daysAgoMatch = dateTextLower.match(/(\d+)\s*(дн|дня|дней|день|days?|day)\s*(назад|ago)/)
		if (daysAgoMatch) {
			const daysAgo = parseInt(daysAgoMatch[1])
			if (daysAgo <= 1) {
				// Только сегодня и вчера
				const targetDate = new Date(today)
				targetDate.setDate(targetDate.getDate() - daysAgo)
				return targetDate.toISOString()
			}
		}

		// "X часов назад", "X hours ago"
		const hoursAgoMatch = dateTextLower.match(/(\d+)\s*(час|часа|часов|ч|hours?|hrs?)\s*(назад|ago)/)
		if (hoursAgoMatch) {
			const hoursAgo = parseInt(hoursAgoMatch[1])
			if (hoursAgo <= 24) {
				// Только за последние 24 часа
				const targetDate = new Date(now)
				targetDate.setHours(targetDate.getHours() - hoursAgo)
				return targetDate.toISOString()
			}
		}

		// "X минут назад", "X minutes ago"
		const minutesAgoMatch = dateTextLower.match(/(\d+)\s*(мин|минут|минуты|min|minutes?)\s*(назад|ago)/)
		if (minutesAgoMatch) {
			const minutesAgo = parseInt(minutesAgoMatch[1])
			if (minutesAgo <= 1440) {
				// Только за последние 24 часа
				const targetDate = new Date(now)
				targetDate.setMinutes(targetDate.getMinutes() - minutesAgo)
				return targetDate.toISOString()
			}
		}

		// Пытаемся распарсить как обычную дату
		try {
			const parsedDate = new Date(dateText)
			if (!isNaN(parsedDate.getTime())) {
				// Проверяем, что дата не старше 1 дня
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

	private cleanDescription(description: string): string {
		return description
			.replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
			.replace(/\n\s*\n/g, '\n') // Убираем пустые строки
			.trim()
	}
}
