import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'

interface AIResponse {
	company: {
		name: string
		description?: string
		website?: string
		size?: string
	}
	shortDescription?: string
	fullDescription?: string
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
	private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8001'
	private readonly requestTimeout = parseInt(process.env.AI_SERVICE_TIMEOUT || '30000')
	private readonly maxRetries = parseInt(process.env.AI_SERVICE_RETRIES || '3')

	constructor() {}

	async checkHealth(): Promise<{ ollama_available: boolean; model_loaded: boolean }> {
		try {
			const response = await axios.get(`${this.aiServiceUrl}/health`, {
				timeout: 5000
			})
			return response.data
		} catch (error) {
			this.logger.error('Ошибка проверки здоровья AI сервиса:', error.message)
			return { ollama_available: false, model_loaded: false }
		}
	}

	async normalizeJobWithAI(title: string, description: string): Promise<AIResponse | null> {
		for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
			try {
				this.logger.debug(`Попытка ${attempt}/${this.maxRetries} для вакансии: ${title}`)

				const response = await this.makeAIRequest(title, description)

				if (response) {
					this.logger.debug(`Успешно обработана вакансия: ${title}`)
					return response
				}
			} catch (error) {
				this.logger.warn(`Ошибка на попытке ${attempt} для "${title}": ${error.message}`)

				if (attempt < this.maxRetries) {
					const delay = Math.pow(2, attempt) * 1000
					await this.sleep(delay)
				}
			}
		}

		this.logger.error(`ИИ не смог обработать вакансию "${title}" после ${this.maxRetries} попыток`)
		throw new Error(`AI сервис недоступен после ${this.maxRetries} попыток`)
	}

	private async makeAIRequest(title: string, description: string): Promise<AIResponse | null> {
		try {
			const response = await axios.post(
				`${this.aiServiceUrl}/api/v1/normalize`,
				{
					title,
					description
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					timeout: this.requestTimeout
				}
			)

			if (!response.data) {
				throw new Error('Пустой ответ от AI Service')
			}

			// Конвертируем ответ от AI Service в формат AIService
			return this.convertAIResponse(response.data)
		} catch (error) {
			if (error.code === 'ECONNREFUSED') {
				throw new Error('AI Service недоступен')
			} else if (error.code === 'ECONNABORTED') {
				throw new Error('Таймаут запроса к AI Service')
			} else if (error.response?.status === 500) {
				throw new Error(`Ошибка AI Service: ${error.response.data?.detail || error.message}`)
			} else {
				throw new Error(`Ошибка AI Service: ${error.message}`)
			}
		}
	}

	private convertAIResponse(data: any): AIResponse {
		return {
			company: {
				name: data.company?.name || '',
				description: data.company?.description,
				website: data.company?.website,
				size: data.company?.size
			},
			shortDescription: data.short_description,
			fullDescription: data.full_description,
			salary: data.salary
				? {
						min: data.salary.min,
						max: data.salary.max,
						currency: data.salary.currency,
						period: data.salary.period,
						type: data.salary.type
					}
				: undefined,
			location: data.location
				? {
						city: data.location.city,
						country: data.location.country,
						address: data.location.address,
						remote: data.location.remote
					}
				: undefined,
			requirements: {
				required: data.requirements?.required || [],
				preferred: data.requirements?.preferred || [],
				technical: data.requirements?.technical || [],
				languages: data.requirements?.languages || [],
				frameworks: data.requirements?.frameworks || [],
				tools: data.requirements?.tools || []
			},
			benefits: data.benefits
				? {
						social: data.benefits.social || [],
						bonuses: data.benefits.bonuses || [],
						conditions: data.benefits.conditions || [],
						development: data.benefits.development || []
					}
				: undefined,
			workType: data.work_type || 'full_time',
			experienceLevel: data.experience_level
		}
	}

	private sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms))
	}
}
