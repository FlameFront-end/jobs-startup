import { Injectable } from '@nestjs/common'
import { Page } from 'puppeteer'
import { TextProcessorService } from '../../../common/text-processor.service'
import { CreateJobDto } from '../../../database/dto/job.dto'
import { ParserConfig } from '../config/parser-config'
import { HtmlExtractorService } from '../services/html-extractor.service'
import { BaseParser } from './base-parser'

@Injectable()
export class HabrParser extends BaseParser {
	constructor(
		textProcessor: TextProcessorService,
		private htmlExtractor: HtmlExtractorService
	) {
		super(textProcessor)
	}

	async parse(page: Page, config: ParserConfig): Promise<CreateJobDto[]> {
		await this.waitForContent(page, '.vacancy-card')

		// Получаем базовую информацию о вакансиях
		const jobElements = await page.evaluate(() => {
			const jobs: any[] = []
			const vacancyCards = document.querySelectorAll('.vacancy-card')

			vacancyCards.forEach((card: any) => {
				let title = ''
				const titleSelectors = ['.vacancy-card__title a', '.vacancy-card__title-link', 'a[href*="/vacancies/"]']

				for (const selector of titleSelectors) {
					const titleEl = card.querySelector(selector)
					if (titleEl && titleEl.textContent?.trim()) {
						title = titleEl.textContent.trim()
						break
					}
				}

				if (title) {
					let link = ''
					const linkSelectors = [
						'a[href*="/vacancies/"]',
						'.vacancy-card__title a',
						'.vacancy-card__title-link'
					]

					for (const selector of linkSelectors) {
						const linkEl = card.querySelector(selector)
						if (linkEl && linkEl.getAttribute('href')) {
							link = linkEl.getAttribute('href')
							break
						}
					}

					if (link) {
						jobs.push({
							title,
							originalUrl: link.startsWith('http') ? link : `https://career.habr.com${link}`
						})
					}
				}
			})

			return jobs
		})

		// Получаем полные описания для каждой вакансии
		const jobsWithDescriptions: CreateJobDto[] = []

		for (let i = 0; i < jobElements.length; i++) {
			const job = jobElements[i]
			try {
				const fullDescription = await this.htmlExtractor.getFullJobDescription(job.originalUrl)

				jobsWithDescriptions.push(
					this.processJobData(
						{
							...job,
							description: fullDescription
						},
						config
					)
				)
			} catch (error) {
				// Добавляем вакансию с кратким описанием
				jobsWithDescriptions.push(
					this.processJobData(
						{
							...job,
							description: 'Описание недоступно'
						},
						config
					)
				)
			}
		}

		return jobsWithDescriptions
	}
}
