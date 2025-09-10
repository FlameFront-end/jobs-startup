import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { ParserConfig } from '../config/parser-config'

export interface ExtractedJobData {
	title: string
	description: string
	originalUrl?: string
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

		if (!title) return null

		const originalUrl = link ? this.normalizeUrl(link, config.baseUrl) : undefined

		return {
			title: title.trim(),
			description: description ? description.trim() : '',
			originalUrl
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

	async getFullJobDescription(url: string): Promise<string> {
		try {
			const html = await this.fetchPage(url)
			const $ = cheerio.load(html)

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

			for (const selector of mainDescSelectors) {
				const descEl = $(selector)
				if (descEl.length && descEl.text().trim()) {
					const description = descEl.text().trim()
					return this.cleanDescription(description)
				}
			}

			// Fallback селекторы
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
					return this.cleanDescription(descEl.text().trim())
				}
			}

			// Если все еще не нашли, берем весь контент страницы и фильтруем
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
				return this.cleanDescription(relevantLines.join(' ').substring(0, 3000))
			}

			return 'Описание не найдено'
		} catch (error) {
			this.logger.error(`Error fetching job description from ${url}:`, error.message)
			throw error
		}
	}

	private cleanDescription(description: string): string {
		return description
			.replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
			.replace(/\n\s*\n/g, '\n') // Убираем пустые строки
			.trim()
	}
}
