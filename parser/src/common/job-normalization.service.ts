import { Injectable, Logger } from '@nestjs/common'
import { CreateJobDto } from '../database/dto/job.dto'
import {
	Benefits,
	CompanyInfo,
	ExperienceLevel,
	LocationInfo,
	NormalizedJobDto,
	Requirements,
	SalaryInfo,
	WorkType
} from '../database/dto/normalized-job.dto'
import { AIService } from './ai-service'

@Injectable()
export class JobNormalizationService {
	private readonly logger = new Logger(JobNormalizationService.name)

	constructor(private readonly aiService: AIService) {}

	/**
	 * Нормализует вакансию в структурированный формат с помощью ИИ
	 */
	async normalizeJob(job: CreateJobDto, jobId?: string): Promise<NormalizedJobDto | null> {
		try {
			// Проверяем, была ли зарплата указана в исходном тексте
			const hasSalaryInText = this.hasSalaryInOriginalText(job.title, job.description)

			// Используем ИИ для нормализации
			const aiResponse = await this.aiService.normalizeJobWithAI(job.title, job.description)

			if (!aiResponse) {
				return null
			}

			// Преобразуем ответ ИИ в наш формат
			const company: CompanyInfo = {
				name: aiResponse.company.name,
				description: aiResponse.company.description,
				website: aiResponse.company.website,
				size: aiResponse.company.size
			}

			// Дополнительная проверка: AI не должен придумывать зарплату
			const salary: SalaryInfo | undefined =
				aiResponse.salary && hasSalaryInText && this.isValidSalary(aiResponse.salary)
					? {
							min: aiResponse.salary.min,
							max: aiResponse.salary.max,
							currency: aiResponse.salary.currency as any,
							period: aiResponse.salary.period as any,
							type: aiResponse.salary.type
						}
					: undefined

			const location: LocationInfo | undefined = aiResponse.location
				? {
						city: aiResponse.location.city,
						country: aiResponse.location.country,
						address: aiResponse.location.address,
						remote: aiResponse.location.remote
					}
				: undefined

			const requirements: Requirements = {
				required: aiResponse.requirements.required,
				preferred: aiResponse.requirements.preferred,
				technical: aiResponse.requirements.technical,
				languages: aiResponse.requirements.languages,
				frameworks: aiResponse.requirements.frameworks,
				tools: aiResponse.requirements.tools
			}

			const benefits: Benefits | undefined = aiResponse.benefits
				? {
						social: aiResponse.benefits.social,
						bonuses: aiResponse.benefits.bonuses,
						conditions: aiResponse.benefits.conditions,
						development: aiResponse.benefits.development
					}
				: undefined

			const workType = this.mapWorkType(aiResponse.workType)
			const experienceLevel = aiResponse.experienceLevel
				? this.mapExperienceLevel(aiResponse.experienceLevel)
				: undefined

			// Вычисляем качество данных
			const qualityScore = this.calculateQualityScore({
				company,
				salary,
				location,
				requirements,
				benefits,
				workType,
				experienceLevel
			})

			// Если качество слишком низкое, пропускаем вакансию
			if (qualityScore < 30) {
				return null
			}

			const normalizedJob: NormalizedJobDto = {
				id: jobId || job.contentHash,
				title: job.title,
				shortDescription: aiResponse.shortDescription || this.createShortDescription(job.description),
				fullDescription: aiResponse.fullDescription || this.createFullDescription(job.description),
				company,
				salary,
				location,
				requirements,
				benefits,
				workType,
				experienceLevel,
				source: job.source,
				sourceName: job.sourceName,
				originalUrl: job.originalUrl,
				publishedAt: new Date(job.publishedAt),
				parsedAt: new Date(),
				qualityScore,
				keywords: job.keywords
			}

			return normalizedJob
		} catch (error) {
			this.logger.error(`Ошибка нормализации вакансии "${job.title}":`, error)
			return null
		}
	}

	private mapWorkType(workType: string): WorkType {
		const mapping: Record<string, WorkType> = {
			full_time: WorkType.FULL_TIME,
			part_time: WorkType.PART_TIME,
			contract: WorkType.CONTRACT,
			internship: WorkType.INTERNSHIP,
			remote: WorkType.REMOTE,
			hybrid: WorkType.HYBRID
		}
		return mapping[workType] || WorkType.FULL_TIME
	}

	private mapExperienceLevel(experienceLevel: string): ExperienceLevel {
		const mapping: Record<string, ExperienceLevel> = {
			no_experience: ExperienceLevel.NO_EXPERIENCE,
			junior: ExperienceLevel.JUNIOR,
			middle: ExperienceLevel.MIDDLE,
			senior: ExperienceLevel.SENIOR,
			lead: ExperienceLevel.LEAD
		}
		return mapping[experienceLevel] || ExperienceLevel.MIDDLE
	}

	private calculateQualityScore(data: {
		company: CompanyInfo
		salary?: SalaryInfo
		location?: LocationInfo
		requirements: Requirements
		benefits?: Benefits
		workType: WorkType
		experienceLevel?: ExperienceLevel
	}): number {
		let score = 0

		// Базовые поля (обязательные)
		if (data.company.name && data.company.name !== null) score += 20
		if (data.requirements.required.length > 0) score += 20
		if (data.workType) score += 10

		// Дополнительные поля
		if (data.salary) score += 15
		if (data.location) score += 10
		if (data.experienceLevel) score += 10
		if (data.benefits && Object.values(data.benefits).some(arr => arr && arr.length > 0)) score += 10

		// Технические навыки
		if (data.requirements.technical && data.requirements.technical.length > 0) score += 5

		return Math.min(score, 100)
	}

	private createShortDescription(description: string): string {
		const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10)
		const dutyKeywords = [
			'разработка',
			'создание',
			'программирование',
			'написание',
			'реализация',
			'проектирование',
			'архитектура',
			'интеграция',
			'оптимизация',
			'тестирование',
			'react',
			'vue',
			'angular',
			'typescript',
			'javascript',
			'next.js',
			'node.js'
		]

		const relevantSentences = sentences.filter(
			sentence =>
				sentence &&
				typeof sentence === 'string' &&
				dutyKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
		)

		const selectedSentences = relevantSentences.length > 0 ? relevantSentences.slice(0, 3) : sentences.slice(0, 3)

		return (
			selectedSentences
				.map(s => s.trim())
				.filter(s => s.length > 0)
				.join('. ') + '.'
		)
	}

	private createFullDescription(description: string): string {
		const cleaned = description
			.replace(/\s+/g, ' ')
			.replace(/([.!?])\s*([А-ЯЁ])/g, '$1 $2')
			.replace(/([а-яё])([А-ЯЁ])/g, '$1. $2')
			.replace(/([.!?])([А-ЯЁ])/g, '$1 $2')
			.trim()

		const sectionKeywords = [
			'О компании',
			'О команде',
			'Мы',
			'Наша команда',
			'Обязанности',
			'Что нужно делать',
			'Задачи',
			'Функции',
			'Требования',
			'Необходимо',
			'Должен',
			'Опыт',
			'Мы предлагаем',
			'Условия работы',
			'Бонусы',
			'Преимущества',
			'Процесс найма',
			'Интервью',
			'Этапы'
		]

		let structured = cleaned
		sectionKeywords.forEach(keyword => {
			const regex = new RegExp(`(${keyword}[^.!?]*[.!?])`, 'gi')
			structured = structured.replace(regex, '\n\n$1')
		})

		structured = structured
			.replace(/\n\s*\n\s*\n/g, '\n\n')
			.replace(/^\s+|\s+$/gm, '')
			.trim()

		return structured.split('\n\n').length > 2 ? structured : cleaned
	}

	/**
	 * Проверяет, есть ли упоминание зарплаты в исходном тексте
	 */
	private hasSalaryInOriginalText(title: string, description: string): boolean {
		const text = `${title} ${description}`.toLowerCase()

		// Ищем блок с заголовком "Зарплата" в HTML
		const salaryBlockMatch = text.match(
			/<div[^>]*class="[^"]*content-section[^"]*"[^>]*>.*?<h2[^>]*class="[^"]*content-section__title[^"]*"[^>]*>.*?зарплата.*?<\/h2>.*?<\/div>/is
		)

		if (salaryBlockMatch) {
			const salaryBlock = salaryBlockMatch[0]
			const salaryPatterns = [
				// Рубли
				/\d+\s*(тыс|тысяч|k)\s*(руб|рублей|₽)/,
				/\d+\s*(руб|рублей|₽)/,
				/от\s*\d+\s*(тыс|тысяч|k)?\s*(руб|рублей|₽)/,
				/до\s*\d+\s*(тыс|тысяч|k)?\s*(руб|рублей|₽)/,
				/\d+\s*-\s*\d+\s*(тыс|тысяч|k)?\s*(руб|рублей|₽)/,
				/от\s*\d+\s*до\s*\d+\s*(тыс|тысяч|k)?\s*(руб|рублей|₽)/,
				// Доллары
				/\d+\s*(\$|долларов|usd)/,
				/от\s*\d+\s*(\$|долларов|usd)/,
				/до\s*\d+\s*(\$|долларов|usd)/,
				/\d+\s*-\s*\d+\s*(\$|долларов|usd)/,
				/от\s*\d+\s*до\s*\d+\s*(\$|долларов|usd)/,
				// Евро
				/\d+\s*(€|евро|eur)/,
				/от\s*\d+\s*(€|евро|eur)/,
				/до\s*\d+\s*(€|евро|eur)/,
				/\d+\s*-\s*\d+\s*(€|евро|eur)/,
				/от\s*\d+\s*до\s*\d+\s*(€|евро|eur)/
			]
			return salaryPatterns.some(pattern => pattern.test(salaryBlock))
		}

		// Ищем в JSON-LD структуре
		const jsonLdMatch = text.match(/<script[^>]*type="application\/ld\+json"[^>]*>.*?<\/script>/is)
		if (jsonLdMatch) {
			try {
				const jsonContent = jsonLdMatch[0].replace(/<script[^>]*>/, '').replace(/<\/script>/, '')
				const jsonData = JSON.parse(jsonContent)
				if (jsonData['@type'] === 'JobPosting' && jsonData.baseSalary) {
					const baseSalary = jsonData.baseSalary
					return !!(baseSalary.value && baseSalary.value.minValue && baseSalary.value.maxValue)
				}
			} catch (e) {
				// Игнорируем ошибки парсинга JSON
			}
		}

		// Ищем зарплату в тексте описания
		const salaryPatterns = [
			// Рубли
			/\d+\s*(тыс|тысяч|k)\s*(руб|рублей|₽)/,
			/\d+\s*(руб|рублей|₽)/,
			/от\s*\d+\s*(тыс|тысяч|k)?\s*(руб|рублей|₽)/,
			/до\s*\d+\s*(тыс|тысяч|k)?\s*(руб|рублей|₽)/,
			/\d+\s*-\s*\d+\s*(тыс|тысяч|k)?\s*(руб|рублей|₽)/,
			/от\s*\d+\s*до\s*\d+\s*(тыс|тысяч|k)?\s*(руб|рублей|₽)/,
			// Доллары
			/\d+\s*(\$|долларов|usd)/,
			/от\s*\d+\s*(\$|долларов|usd)/,
			/до\s*\d+\s*(\$|долларов|usd)/,
			/\d+\s*-\s*\d+\s*(\$|долларов|usd)/,
			/от\s*\d+\s*до\s*\d+\s*(\$|долларов|usd)/,
			// Евро
			/\d+\s*(€|евро|eur)/,
			/от\s*\d+\s*(€|евро|eur)/,
			/до\s*\d+\s*(€|евро|eur)/,
			/\d+\s*-\s*\d+\s*(€|евро|eur)/,
			/от\s*\d+\s*до\s*\d+\s*(€|евро|eur)/
		]

		return salaryPatterns.some(pattern => pattern.test(text))
	}

	/**
	 * Проверяет, что зарплата валидна и не придумана AI
	 */
	private isValidSalary(salary: any): boolean {
		if (!salary) return false
		if (!salary.min && !salary.max) return false
		if (salary.min && (typeof salary.min !== 'number' || salary.min < 0 || salary.min > 10000000)) return false
		if (salary.max && (typeof salary.max !== 'number' || salary.max < 0 || salary.max > 10000000)) return false
		if (salary.min && salary.max && salary.max < salary.min) return false
		if (salary.currency && !['RUB', 'USD', 'EUR'].includes(salary.currency)) return false
		return true
	}
}
