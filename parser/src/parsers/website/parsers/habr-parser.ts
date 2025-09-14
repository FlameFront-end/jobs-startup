import { Injectable, Logger } from '@nestjs/common'
import { Page } from 'puppeteer'
import { AIService } from '../../../common/ai-service'
import { TextProcessorService } from '../../../common/text-processor.service'
import { CreateJobDto } from '../../../database/dto/job.dto'
import { ParserConfig } from '../config/parser-config'
import { HtmlExtractorService } from '../services/html-extractor.service'
import { BaseParser } from './base-parser'

interface HabrJobData {
	title: string
	originalUrl: string
	publishedAt?: string
	salary?: string
	company: {
		name: string | null
		size: string | null
		description: string | null
		website: string | null
	}
}

interface ParsingMetrics {
	totalJobs: number
	successfulJobs: number
	failedJobs: number
	aiNormalizedJobs: number
	processingTimeMs: number
	averageJobTimeMs: number
	errors: string[]
}

@Injectable()
export class HabrParser extends BaseParser {
	protected readonly logger = new Logger(HabrParser.name)
	private readonly maxRetries = 3
	private readonly retryDelay = 1000

	// Оптимизированные селекторы для лучшей производительности
	private static readonly SELECTORS = {
		// Основные селекторы
		CONTAINER: '.vacancy-card',
		TITLE: ['.vacancy-card__title a', '.vacancy-card__title-link', 'a[href*="/vacancies/"]'],
		LINK: ['a[href*="/vacancies/"]', '.vacancy-card__title a', '.vacancy-card__title-link'],

		// Информация о компании
		COMPANY_NAME: [
			'.vacancy-card__company-title',
			'.vacancy-card__company-name',
			'.company-name',
			'.vacancy-card__company a',
			'.vacancy-card__company-title a',
			'[data-qa="company-name"]',
			'.vacancy-card__meta .vacancy-card__company'
		],
		COMPANY_SIZE: [
			'.vacancy-card__company-size',
			'.company-size',
			'.vacancy-card__meta .company-size',
			'[data-qa="company-size"]'
		],
		COMPANY_DESCRIPTION: [
			'.vacancy-card__company-description',
			'.company-description',
			'.vacancy-card__meta .company-description'
		],
		COMPANY_WEBSITE: [
			'.vacancy-card__company a[href^="http"]',
			'.company-website a[href^="http"]',
			'.vacancy-card__company a[href*="."]'
		],

		// Зарплата и дата
		SALARY: [
			'.vacancy-card__salary',
			'.salary',
			'.vacancy-card__meta .salary',
			'[class*="salary"]',
			'.vacancy-card__compensation'
		],
		DATE: [
			'.vacancy-card__date',
			'.vacancy-card__meta .vacancy-card__date',
			'.date',
			'[class*="date"]',
			'.vacancy-card__published'
		]
	} as const

	constructor(
		textProcessor: TextProcessorService,
		private htmlExtractor: HtmlExtractorService,
		private aiService: AIService
	) {
		super(textProcessor)
	}

	async parse(page: Page, config: ParserConfig): Promise<CreateJobDto[]> {
		const startTime = Date.now()
		const metrics: ParsingMetrics = {
			totalJobs: 0,
			successfulJobs: 0,
			failedJobs: 0,
			aiNormalizedJobs: 0,
			processingTimeMs: 0,
			averageJobTimeMs: 0,
			errors: []
		}

		this.logger.log('Начинаем парсинг Хабр Карьеры')

		try {
			await this.waitForContent(page, HabrParser.SELECTORS.CONTAINER)

			const jobElements = await this.extractJobCards(page)
			metrics.totalJobs = jobElements.length
			this.logger.log(`Найдено ${jobElements.length} вакансий на странице`)

			const jobsWithDescriptions = await this.processJobsWithDescriptions(jobElements, config, metrics)

			metrics.processingTimeMs = Date.now() - startTime
			metrics.averageJobTimeMs = metrics.totalJobs > 0 ? metrics.processingTimeMs / metrics.totalJobs : 0

			this.logMetrics(metrics)

			return jobsWithDescriptions.filter(job => job !== null) as CreateJobDto[]
		} catch (error) {
			metrics.processingTimeMs = Date.now() - startTime
			metrics.errors.push(`Критическая ошибка: ${error.message}`)
			this.logger.error('Ошибка при парсинге Хабр Карьеры:', error)
			this.logMetrics(metrics)
			throw error
		}
	}

	private async extractJobCards(page: Page): Promise<HabrJobData[]> {
		return await page.evaluate(selectors => {
			const jobs: any[] = []
			const vacancyCards = document.querySelectorAll(selectors.CONTAINER)

			vacancyCards.forEach((card: any) => {
				const jobData = extractJobFromCard(card, selectors)
				if (jobData) {
					jobs.push(jobData)
				}
			})

			return jobs

			// Функция извлечения данных (в браузерном контексте)
			function extractJobFromCard(card: any, selectors: any): any | null {
				const title = findTextBySelectors(card, selectors.TITLE)
				if (!title) return null

				const link = findAttributeBySelectors(card, selectors.LINK, 'href')
				if (!link) return null

				const company = extractCompanyInfo(card, selectors)
				const salary = findTextBySelectors(card, selectors.SALARY)
				const publishedAt = findTextBySelectors(card, selectors.DATE)

				return {
					title,
					originalUrl: link.startsWith('http') ? link : `https://career.habr.com${link}`,
					publishedAt: publishedAt || undefined,
					salary: salary || undefined,
					company
				}
			}

			function extractCompanyInfo(card: any, selectors: any): any {
				const name = findTextBySelectors(card, selectors.COMPANY_NAME)
				const size = findTextBySelectors(card, selectors.COMPANY_SIZE)
				const description = findTextBySelectors(card, selectors.COMPANY_DESCRIPTION)
				const website = findAttributeBySelectors(card, selectors.COMPANY_WEBSITE, 'href')

				return {
					name: name || null,
					size: size || null,
					description: description || null,
					website: website || null
				}
			}

			function findTextBySelectors(element: any, selectors: string[]): string {
				for (const selector of selectors) {
					try {
						const el = element.querySelector(selector)
						if (el && el.textContent?.trim()) {
							return el.textContent.trim()
						}
					} catch (error) {
						continue
					}
				}
				return ''
			}

			function findAttributeBySelectors(element: any, selectors: string[], attribute: string): string {
				for (const selector of selectors) {
					try {
						const el = element.querySelector(selector)
						if (el && el.getAttribute(attribute)) {
							return el.getAttribute(attribute)
						}
					} catch (error) {
						continue
					}
				}
				return ''
			}
		}, HabrParser.SELECTORS)
	}

	private findTextBySelectors(element: any, selectors: readonly string[]): string {
		// Оптимизация: используем наиболее вероятные селекторы первыми
		for (const selector of selectors) {
			try {
				const el = element.querySelector(selector)
				if (el && el.textContent?.trim()) {
					return el.textContent.trim()
				}
			} catch (error) {
				// Игнорируем ошибки селекторов и продолжаем
				continue
			}
		}
		return ''
	}

	private findAttributeBySelectors(element: any, selectors: readonly string[], attribute: string): string {
		// Оптимизация: используем наиболее вероятные селекторы первыми
		for (const selector of selectors) {
			try {
				const el = element.querySelector(selector)
				if (el && el.getAttribute(attribute)) {
					return el.getAttribute(attribute)
				}
			} catch (error) {
				// Игнорируем ошибки селекторов и продолжаем
				continue
			}
		}
		return ''
	}

	private async processJobsWithDescriptions(
		jobElements: HabrJobData[],
		config: ParserConfig,
		metrics: ParsingMetrics
	): Promise<CreateJobDto[]> {
		const jobsWithDescriptions: CreateJobDto[] = []

		for (let i = 0; i < jobElements.length; i++) {
			const job = jobElements[i]
			const jobStartTime = Date.now()

			try {
				const processedJob = await this.processJobWithRetry(job, config, metrics)
				if (processedJob) {
					jobsWithDescriptions.push(processedJob)
					metrics.successfulJobs++
				} else {
					metrics.failedJobs++
					metrics.errors.push(`Не удалось обработать вакансию: ${job.title}`)
				}
			} catch (error) {
				metrics.failedJobs++
				metrics.errors.push(`Ошибка обработки "${job.title}": ${error.message}`)
				this.logger.warn(`Не удалось обработать вакансию "${job.title}": ${error.message}`)

				// Добавляем вакансию с базовой информацией
				try {
					const fallbackJob = this.processJobData(
						{
							...job,
							description: 'Описание недоступно'
						},
						config
					)

					if (fallbackJob) {
						jobsWithDescriptions.push(fallbackJob)
						metrics.successfulJobs++
					}
				} catch (fallbackError) {
					metrics.errors.push(`Ошибка fallback для "${job.title}": ${fallbackError.message}`)
					this.logger.error(`Fallback обработка не удалась для "${job.title}": ${fallbackError.message}`)
				}
			}

			const jobProcessingTime = Date.now() - jobStartTime
			if (jobProcessingTime > 5000) {
				this.logger.warn(`Медленная обработка вакансии "${job.title}": ${jobProcessingTime}ms`)
			}
		}

		return jobsWithDescriptions
	}

	private async processJobWithRetry(
		job: HabrJobData,
		config: ParserConfig,
		metrics: ParsingMetrics
	): Promise<CreateJobDto | null> {
		for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
			try {
				const fullJobData = await this.htmlExtractor.getFullJobDescription(job.originalUrl)

				const combinedJobData = {
					...job,
					description: fullJobData.description,
					salary: fullJobData.salary || job.salary,
					publishedAt: fullJobData.publishedAt || job.publishedAt
				}

				// Применяем ИИ нормализацию
				const aiNormalizedData = await this.normalizeWithAI(combinedJobData)
				if (aiNormalizedData) {
					metrics.aiNormalizedJobs++
				}
				const finalJobData = aiNormalizedData || combinedJobData

				return this.processJobData(finalJobData, config)
			} catch (error) {
				if (attempt === this.maxRetries) {
					metrics.errors.push(`Все попытки исчерпаны для "${job.title}": ${error.message}`)
					throw error
				}

				metrics.errors.push(`Попытка ${attempt} не удалась для "${job.title}": ${error.message}`)
				this.logger.warn(
					`Попытка ${attempt} не удалась для "${job.title}", повторяем через ${this.retryDelay}ms`
				)
				await this.sleep(this.retryDelay * attempt)
			}
		}

		return null
	}

	private async normalizeWithAI(jobData: any): Promise<any> {
		try {
			const aiResponse = await this.aiService.normalizeJobWithAI(jobData.title, jobData.description)

			if (!aiResponse) {
				return null
			}

			// Объединяем данные из ИИ с исходными данными
			return {
				...jobData,
				description: aiResponse.fullDescription || jobData.description,
				salary: this.extractSalaryFromAI(aiResponse) || jobData.salary,
				company: {
					...jobData.company,
					name: aiResponse.company?.name || jobData.company.name,
					description: aiResponse.company?.description || jobData.company.description,
					website: aiResponse.company?.website || jobData.company.website,
					size: aiResponse.company?.size || jobData.company.size
				},
				// Добавляем дополнительные поля из ИИ
				aiData: {
					shortDescription: aiResponse.shortDescription,
					location: aiResponse.location,
					requirements: aiResponse.requirements,
					benefits: aiResponse.benefits,
					workType: aiResponse.workType,
					experienceLevel: aiResponse.experienceLevel
				}
			}
		} catch (error) {
			this.logger.warn(`Ошибка ИИ нормализации для "${jobData.title}": ${error.message}`)
			return null
		}
	}

	private extractSalaryFromAI(aiResponse: any): string | undefined {
		if (!aiResponse.salary) return undefined

		const { min, max, currency } = aiResponse.salary
		if (!min && !max) return undefined

		const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₽'

		if (min && max) {
			return `от ${min} до ${max} ${currencySymbol}`
		} else if (min) {
			return `от ${min} ${currencySymbol}`
		} else if (max) {
			return `до ${max} ${currencySymbol}`
		}

		return undefined
	}

	private sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms))
	}

	private logMetrics(metrics: ParsingMetrics): void {
		const successRate = metrics.totalJobs > 0 ? (metrics.successfulJobs / metrics.totalJobs) * 100 : 0
		const aiNormalizationRate = metrics.totalJobs > 0 ? (metrics.aiNormalizedJobs / metrics.totalJobs) * 100 : 0

		this.logger.log('=== МЕТРИКИ ПАРСИНГА ХАБР КАРЬЕРЫ ===')
		this.logger.log(`Всего вакансий: ${metrics.totalJobs}`)
		this.logger.log(`Успешно обработано: ${metrics.successfulJobs}`)
		this.logger.log(`Неудачных: ${metrics.failedJobs}`)
		this.logger.log(`Нормализовано ИИ: ${metrics.aiNormalizedJobs}`)
		this.logger.log(`Процент успеха: ${successRate.toFixed(1)}%`)
		this.logger.log(`Процент ИИ нормализации: ${aiNormalizationRate.toFixed(1)}%`)
		this.logger.log(`Время обработки: ${metrics.processingTimeMs}ms`)
		this.logger.log(`Среднее время на вакансию: ${metrics.averageJobTimeMs.toFixed(1)}ms`)

		if (metrics.errors.length > 0) {
			this.logger.warn(`Ошибки (${metrics.errors.length}):`)
			metrics.errors.forEach((error, index) => {
				this.logger.warn(`  ${index + 1}. ${error}`)
			})
		}

		this.logger.log('=====================================')
	}
}
