import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { JOB_NORMALIZATION_PROMPT } from './ai-prompts'

interface AIResponse {
	company: {
		name: string
		description?: string
		website?: string
		size?: string
	}
	salary?: {
		min?: number
		max?: number
		currency?: string
		period?: string
		type?: string
	}
	location?: {
		city?: string
		country?: string
		address?: string
		remote?: boolean
	}
	requirements: {
		required: string[]
		preferred?: string[]
		technical?: string[]
		languages?: string[]
		frameworks?: string[]
		tools?: string[]
	}
	benefits?: {
		social?: string[]
		bonuses?: string[]
		conditions?: string[]
		development?: string[]
	}
	workType: string
	experienceLevel?: string
}

@Injectable()
export class AIService {
	private readonly logger = new Logger(AIService.name)
	private readonly yandexApiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
	private readonly apiKey = process.env.YANDEX_API_KEY

	async normalizeJobWithAI(title: string, description: string): Promise<AIResponse | null> {
		try {
			if (!this.apiKey) {
				this.logger.warn('YANDEX_API_KEY не настроен, используем fallback')
				return this.fallbackNormalization(title, description)
			}

			const prompt = JOB_NORMALIZATION_PROMPT.replace('{title}', title).replace('{description}', description)

			const response = await axios.post(
				this.yandexApiUrl,
				{
					modelUri: `gpt://${process.env.YANDEX_FOLDER_ID}/yandexgpt`,
					completionOptions: {
						stream: false,
						temperature: 0.1,
						maxTokens: 2000
					},
					messages: [
						{
							role: 'system',
							text: 'Ты эксперт по анализу IT-вакансий. Отвечай только в формате JSON без дополнительных комментариев.'
						},
						{
							role: 'user',
							text: prompt
						}
					]
				},
				{
					headers: {
						Authorization: `Api-Key ${this.apiKey}`,
						'Content-Type': 'application/json'
					},
					timeout: 30000
				}
			)

			const aiResponse = response.data.result.alternatives[0].message.text
			this.logger.debug('AI Response:', aiResponse)

			// Парсим JSON ответ
			const normalizedData = JSON.parse(aiResponse) as AIResponse
			return this.validateAndCleanResponse(normalizedData)
		} catch (error) {
			this.logger.error('Ошибка при обращении к Yandex GPT:', error)

			// Пробуем fallback
			try {
				return this.fallbackNormalization(title, description)
			} catch (fallbackError) {
				this.logger.error('Ошибка в fallback нормализации:', fallbackError)
				return null
			}
		}
	}

	private async fallbackNormalization(title: string, description: string): Promise<AIResponse | null> {
		// Простая fallback логика на основе регулярных выражений
		const text = `${title} ${description}`.toLowerCase()

		const company = this.extractCompanyFallback(text, description)
		const salary = this.extractSalaryFallback(text)
		const location = this.extractLocationFallback(text)
		const requirements = this.extractRequirementsFallback(text)
		const benefits = this.extractBenefitsFallback(text)
		const workType = this.determineWorkTypeFallback(text)
		const experienceLevel = this.determineExperienceLevelFallback(text)

		return {
			company,
			salary,
			location,
			requirements,
			benefits,
			workType,
			experienceLevel
		}
	}

	private extractCompanyFallback(text: string, description: string): AIResponse['company'] {
		// Простой поиск названия компании
		const companyPatterns = [
			/компания\s+([а-яё\w\s&.-]+)/i,
			/в\s+компании\s+([а-яё\w\s&.-]+)/i,
			/работа\s+в\s+([а-яё\w\s&.-]+)/i
		]

		for (const pattern of companyPatterns) {
			const match = description.match(pattern)
			if (match && match[1]) {
				return { name: match[1].trim() }
			}
		}

		return { name: 'Не указано' }
	}

	private extractSalaryFallback(text: string): AIResponse['salary'] | null {
		const salaryPatterns = [
			/(\d+)\s*-\s*(\d+)\s*(\d{3})\s*руб/i,
			/(\d+)\s*-\s*(\d+)\s*тыс/i,
			/от\s*(\d+)\s*(\d{3})?\s*руб/i,
			/до\s*(\d+)\s*(\d{3})?\s*руб/i
		]

		for (const pattern of salaryPatterns) {
			const match = text.match(pattern)
			if (match) {
				const salary: AIResponse['salary'] = {
					currency: 'RUB',
					period: 'month'
				}

				if (match[1] && match[2]) {
					salary.min = parseInt(match[1]) * (match[2].length === 3 ? 1000 : 1)
					salary.max = parseInt(match[2]) * (match[2].length === 3 ? 1000 : 1)
				} else if (match[1]) {
					salary.min = parseInt(match[1]) * (match[2]?.length === 3 ? 1000 : 1)
				}

				return salary
			}
		}

		return null
	}

	private extractLocationFallback(text: string): AIResponse['location'] | null {
		const cityPatterns = [
			/москва/i,
			/санкт-петербург|спб/i,
			/екатеринбург/i,
			/новосибирск/i,
			/нижний\s+новгород/i,
			/казань/i,
			/челябинск/i,
			/омск/i,
			/самара/i,
			/ростов-на-дону/i
		]

		const location: AIResponse['location'] = {
			country: 'Россия'
		}

		// Проверяем на удаленную работу
		if (text.includes('удаленн') || text.includes('remote') || text.includes('из дома')) {
			location.remote = true
		}

		// Ищем город
		for (const pattern of cityPatterns) {
			if (pattern.test(text)) {
				location.city = pattern.source.replace(/[()]/g, '').replace(/\|/g, ' или ')
				break
			}
		}

		return Object.keys(location).length > 1 ? location : null
	}

	private extractRequirementsFallback(text: string): AIResponse['requirements'] {
		const requirements: AIResponse['requirements'] = {
			required: [],
			technical: []
		}

		// Простые технические навыки
		const techSkills = [
			'javascript',
			'typescript',
			'python',
			'java',
			'c#',
			'php',
			'ruby',
			'go',
			'rust',
			'react',
			'vue',
			'angular',
			'node.js',
			'express',
			'nestjs',
			'django',
			'flask',
			'mysql',
			'postgresql',
			'mongodb',
			'redis',
			'elasticsearch',
			'aws',
			'docker',
			'kubernetes',
			'git',
			'ci/cd'
		]

		techSkills.forEach(skill => {
			if (text.includes(skill)) {
				requirements.technical?.push(skill)
			}
		})

		// Общие требования
		if (text.includes('опыт работы')) requirements.required.push('Опыт работы')
		if (text.includes('знание')) requirements.required.push('Знание технологий')
		if (text.includes('ответственность')) requirements.required.push('Ответственность')

		return requirements
	}

	private extractBenefitsFallback(text: string): AIResponse['benefits'] | null {
		const benefits: AIResponse['benefits'] = {
			social: [],
			bonuses: [],
			conditions: [],
			development: []
		}

		// Простые проверки
		if (text.includes('медицинская страховка')) benefits.social?.push('медицинская страховка')
		if (text.includes('отпуск')) benefits.social?.push('отпуск')
		if (text.includes('премия')) benefits.bonuses?.push('премия')
		if (text.includes('гибкий график')) benefits.conditions?.push('гибкий график')
		if (text.includes('обучение')) benefits.development?.push('обучение')

		// Возвращаем только если есть хотя бы что-то
		const hasBenefits = Object.values(benefits).some(arr => arr && arr.length > 0)
		return hasBenefits ? benefits : null
	}

	private determineWorkTypeFallback(text: string): string {
		if (text.includes('удаленн') || text.includes('remote')) return 'remote'
		if (text.includes('гибридн') || text.includes('hybrid')) return 'hybrid'
		if (text.includes('стажировк') || text.includes('intern')) return 'internship'
		if (text.includes('частичн') || text.includes('part-time')) return 'part_time'
		if (text.includes('контракт') || text.includes('contract')) return 'contract'
		return 'full_time'
	}

	private determineExperienceLevelFallback(text: string): string | null {
		if (text.includes('без опыта') || text.includes('junior') || text.includes('стажер')) {
			return 'no_experience'
		}
		if (text.includes('1-3 года') || text.includes('1-2 года') || text.includes('до 3 лет')) {
			return 'junior'
		}
		if (text.includes('3-5 лет') || text.includes('от 3 лет') || text.includes('middle')) {
			return 'middle'
		}
		if (text.includes('5+ лет') || text.includes('от 5 лет') || text.includes('senior')) {
			return 'senior'
		}
		if (text.includes('lead') || text.includes('руководитель') || text.includes('team lead')) {
			return 'lead'
		}
		return null
	}

	private validateAndCleanResponse(data: AIResponse): AIResponse {
		// Валидация и очистка ответа от ИИ
		return {
			company: {
				name: data.company?.name || 'Не указано',
				description: data.company?.description || undefined,
				website: data.company?.website || undefined,
				size: data.company?.size || undefined
			},
			salary: data.salary || null,
			location: data.location || null,
			requirements: {
				required: data.requirements?.required || [],
				preferred: data.requirements?.preferred || [],
				technical: data.requirements?.technical || [],
				languages: data.requirements?.languages || [],
				frameworks: data.requirements?.frameworks || [],
				tools: data.requirements?.tools || []
			},
			benefits: data.benefits || null,
			workType: data.workType || 'full_time',
			experienceLevel: data.experienceLevel || null
		}
	}
}
