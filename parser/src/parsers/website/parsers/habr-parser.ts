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

		// Получаем базовую информацию о вакансиях с данными о компании
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

					// Извлекаем информацию о компании из карточки
					let companyName = ''
					let companySize = ''
					let companyDescription = ''
					let companyWebsite = ''

					// Название компании
					const companySelectors = [
						'.vacancy-card__company-title',
						'.vacancy-card__company-name',
						'.company-name',
						'.vacancy-card__company a',
						'.vacancy-card__company-title a',
						'[data-qa="company-name"]',
						'.vacancy-card__meta .vacancy-card__company'
					]

					for (const selector of companySelectors) {
						const companyEl = card.querySelector(selector)
						if (companyEl && companyEl.textContent?.trim()) {
							companyName = companyEl.textContent.trim()
							break
						}
					}

					// Размер компании
					const sizeSelectors = [
						'.vacancy-card__company-size',
						'.company-size',
						'.vacancy-card__meta .company-size',
						'[data-qa="company-size"]'
					]

					for (const selector of sizeSelectors) {
						const sizeEl = card.querySelector(selector)
						if (sizeEl && sizeEl.textContent?.trim()) {
							companySize = sizeEl.textContent.trim()
							break
						}
					}

					// Описание компании (краткое)
					const descSelectors = [
						'.vacancy-card__company-description',
						'.company-description',
						'.vacancy-card__meta .company-description'
					]

					for (const selector of descSelectors) {
						const descEl = card.querySelector(selector)
						if (descEl && descEl.textContent?.trim()) {
							companyDescription = descEl.textContent.trim()
							break
						}
					}

					// Сайт компании
					const websiteSelectors = [
						'.vacancy-card__company a[href^="http"]',
						'.company-website a[href^="http"]',
						'.vacancy-card__company a[href*="."]'
					]

					for (const selector of websiteSelectors) {
						const websiteEl = card.querySelector(selector)
						if (websiteEl && websiteEl.getAttribute('href')) {
							companyWebsite = websiteEl.getAttribute('href')
							break
						}
					}

					// Извлекаем зарплату
					let salary = ''
					const salarySelectors = [
						'.vacancy-card__salary',
						'.salary',
						'.vacancy-card__meta .salary',
						'[class*="salary"]',
						'.vacancy-card__compensation'
					]

					for (const selector of salarySelectors) {
						const salaryEl = card.querySelector(selector)
						if (salaryEl && salaryEl.textContent?.trim()) {
							salary = salaryEl.textContent.trim()
							break
						}
					}

					// Извлекаем дату публикации
					let publishedAt = ''
					const dateSelectors = [
						'.vacancy-card__date',
						'.vacancy-card__meta .vacancy-card__date',
						'.date',
						'[class*="date"]',
						'.vacancy-card__published'
					]

					for (const selector of dateSelectors) {
						const dateEl = card.querySelector(selector)
						if (dateEl && dateEl.textContent?.trim()) {
							publishedAt = dateEl.textContent.trim()
							break
						}
					}

					if (link) {
						jobs.push({
							title,
							originalUrl: link.startsWith('http') ? link : `https://career.habr.com${link}`,
							publishedAt: publishedAt || undefined,
							salary: salary || undefined,
							company: {
								name: companyName || null,
								size: companySize || null,
								description: companyDescription || null,
								website: companyWebsite || null
							}
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
				const fullJobData = await this.htmlExtractor.getFullJobDescription(job.originalUrl)

				// Объединяем данные из карточки и полного описания
				const combinedJobData = {
					...job,
					description: fullJobData.description,
					// Используем данные из полного описания, если они есть, иначе из карточки
					salary: fullJobData.salary || job.salary,
					publishedAt: fullJobData.publishedAt || job.publishedAt
				}

				jobsWithDescriptions.push(this.processJobData(combinedJobData, config))
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

		// Фильтруем null значения (отфильтрованные по дате)
		return jobsWithDescriptions.filter(job => job !== null) as CreateJobDto[]
	}
}
