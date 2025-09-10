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
	private readonly yandexApiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
	private readonly iamToken = process.env.YANDEX_IAM_TOKEN
	private readonly folderId = process.env.YANDEX_FOLDER_ID
	private gptUnavailableLogged = false

	// Ограничения на запросы к ИИ
	private requestCount = 0
	private lastResetTime = Date.now()
	private readonly MAX_REQUESTS_PER_MINUTE = 20 // Максимум 20 запросов в минуту
	private readonly REQUEST_WINDOW = 60 * 1000 // 1 минута

	constructor() {
		// Проверяем конфигурацию только при ошибках
	}

	async normalizeJobWithAI(title: string, description: string): Promise<AIResponse | null> {
		try {
			if (!this.iamToken || !this.folderId) {
				this.logger.error('YANDEX_IAM_TOKEN или YANDEX_FOLDER_ID не настроены!')
				return null
			}

			// Проверяем лимиты запросов
			if (!this.checkRequestLimits()) {
				return null
			}

			const maxRetries = 3

			for (let attempt = 1; attempt <= maxRetries; attempt++) {
				try {
					return await this.makeAIRequest(title, description)
				} catch (error) {
					if (attempt < maxRetries) {
						const delay = Math.pow(2, attempt) * 1000
						await this.sleep(delay)
					}
				}
			}

			// Если все попытки неудачны
			this.logger.error(`ИИ не смог обработать вакансию "${title}" после ${maxRetries} попыток`)
			return null
		} catch (error) {
			this.logger.error(`Критическая ошибка в normalizeJobWithAI для "${title}":`, error)
			return null
		}
	}

	private async makeAIRequest(title: string, description: string): Promise<AIResponse | null> {
		try {
			const prompt = JOB_NORMALIZATION_PROMPT.replace('{title}', title).replace('{description}', description)
			const modelUri = `gpt://${this.folderId}/yandexgpt`

			const response = await axios.post(
				this.yandexApiUrl,
				{
					modelUri,
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
						Authorization: `Bearer ${this.iamToken}`,
						'Content-Type': 'application/json'
					},
					timeout: 120000
				}
			)

			if (
				!response.data.result ||
				!response.data.result.alternatives ||
				response.data.result.alternatives.length === 0
			) {
				throw new Error('Неверный формат ответа от YandexGPT')
			}

			const aiResponse = response.data.result.alternatives[0].message.text
			const cleanedResponse = this.cleanMarkdownFromResponse(aiResponse)

			try {
				const normalizedData = JSON.parse(cleanedResponse) as AIResponse
				return this.validateAndCleanResponse(normalizedData)
			} catch (parseError) {
				throw new Error(`Ошибка парсинга JSON: ${parseError.message}`)
			}
		} catch (error) {
			if (error.response?.status === 429) {
				throw new Error('Превышен лимит запросов к YandexGPT')
			} else if (error.response?.status === 401) {
				throw new Error('Неверный IAM токен для YandexGPT')
			} else if (error.code === 'ECONNABORTED') {
				throw new Error('Таймаут запроса к YandexGPT')
			} else {
				throw new Error(`Ошибка YandexGPT: ${error.message}`)
			}
		}
	}

	private checkRequestLimits(): boolean {
		const now = Date.now()

		// Сбрасываем счетчик если прошла минута
		if (now - this.lastResetTime >= this.REQUEST_WINDOW) {
			this.requestCount = 0
			this.lastResetTime = now
		}

		// Проверяем лимит
		if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
			return false
		}

		// Увеличиваем счетчик
		this.requestCount++
		return true
	}

	private sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms))
	}

	private cleanMarkdownFromResponse(response: string): string {
		// Удаляем markdown блоки кода (```json ... ```)
		let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '')

		// Удаляем возможные markdown блоки без указания языка
		cleaned = cleaned.replace(/```\s*([\s\S]*?)\s*```/g, '$1')

		// Удаляем лишние пробелы и переносы строк в начале и конце
		cleaned = cleaned.trim()

		// Ищем JSON объект в тексте (между первыми { и последними })
		const jsonStart = cleaned.indexOf('{')
		const jsonEnd = cleaned.lastIndexOf('}')

		if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
			cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
		}

		// Дополнительная очистка - удаляем возможные остатки markdown
		cleaned = cleaned.replace(/^```.*?\n/g, '').replace(/\n```.*?$/g, '')

		return cleaned
	}

	private validateAndCleanResponse(data: AIResponse): AIResponse {
		return {
			company: {
				name: data.company?.name || null,
				description: data.company?.description,
				website: data.company?.website,
				size: data.company?.size
			},
			shortDescription: data.shortDescription || undefined,
			fullDescription: data.fullDescription || undefined,
			salary: data.salary || undefined,
			location: data.location || undefined,
			requirements: {
				required: data.requirements?.required || [],
				preferred: data.requirements?.preferred || [],
				technical: data.requirements?.technical || [],
				languages: data.requirements?.languages || [],
				frameworks: data.requirements?.frameworks || [],
				tools: data.requirements?.tools || []
			},
			benefits: data.benefits || undefined,
			workType: data.workType || 'full_time',
			experienceLevel: data.experienceLevel || undefined
		}
	}
}
