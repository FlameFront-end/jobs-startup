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
		this.logConfiguration()
	}

	private logConfiguration() {
		this.logger.log('=== AIService Configuration ===')
		this.logger.log(`YANDEX_IAM_TOKEN: ${this.iamToken ? '✅ Настроен' : '❌ Не настроен'}`)
		this.logger.log(`YANDEX_FOLDER_ID: ${this.folderId ? '✅ Настроен' : '❌ Не настроен'}`)
		this.logger.log(`Yandex API URL: ${this.yandexApiUrl}`)
		if (this.iamToken) {
			this.logger.log(`IAM Token preview: ${this.iamToken.substring(0, 8)}...`)
		}
		if (this.folderId) {
			this.logger.log(`Folder ID: ${this.folderId}`)
		}
		this.logger.log('===============================')
	}

	async normalizeJobWithAI(title: string, description: string): Promise<AIResponse | null> {
		if (!this.iamToken) {
			this.logger.error('YANDEX_IAM_TOKEN не настроен!')
			return null
		}

		if (!this.folderId) {
			this.logger.error('YANDEX_FOLDER_ID не настроен!')
			return null
		}

		// Проверяем лимиты запросов
		if (!this.checkRequestLimits()) {
			this.logger.warn(`Превышен лимит запросов к ИИ для "${title}"`)
			return null
		}

		const maxRetries = 3

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				return await this.makeAIRequest(title, description, attempt)
			} catch (error) {
				if (attempt < maxRetries) {
					const delay = Math.pow(2, attempt) * 1000 // Экспоненциальная задержка: 2s, 4s, 8s
					this.logger.warn(`Попытка ${attempt} неудачна, повтор через ${delay}ms: ${error.message}`)
					await this.sleep(delay)
				}
			}
		}

		// Если все попытки неудачны
		this.logger.error(`Все ${maxRetries} попытки неудачны для "${title}"`)
		return null
	}

	private async makeAIRequest(title: string, description: string, attempt: number): Promise<AIResponse | null> {
		this.logger.debug(`Запрос к YandexGPT для: "${title}" (попытка ${attempt})`)

		const prompt = JOB_NORMALIZATION_PROMPT.replace('{title}', title).replace('{description}', description)
		const modelUri = `gpt://${this.folderId}/yandexgpt`

		this.logger.debug(`Model URI: ${modelUri}`)
		this.logger.debug(`IAM Token: ${this.iamToken.substring(0, 8)}...`)

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
				timeout: 120000 // 2 минуты
			}
		)

		this.logger.debug(`YandexGPT ответ получен, статус: ${response.status}`)

		if (
			!response.data.result ||
			!response.data.result.alternatives ||
			response.data.result.alternatives.length === 0
		) {
			throw new Error('Неверный формат ответа от YandexGPT')
		}

		const aiResponse = response.data.result.alternatives[0].message.text
		this.logger.debug(`AI Response length: ${aiResponse.length} chars`)
		this.logger.debug(`AI Response preview: ${aiResponse.substring(0, 200)}...`)

		// Очищаем ответ от markdown разметки
		const cleanedResponse = this.cleanMarkdownFromResponse(aiResponse)
		this.logger.debug(`Cleaned response: ${cleanedResponse.substring(0, 500)}...`)

		try {
			const normalizedData = JSON.parse(cleanedResponse) as AIResponse
			this.logger.debug('YandexGPT успешно обработал вакансию')
			return this.validateAndCleanResponse(normalizedData)
		} catch (parseError) {
			this.logger.error(`Ошибка парсинга JSON: ${parseError.message}`)
			this.logger.error(`Ответ AI: ${cleanedResponse}`)
			throw parseError
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
				name: data.company?.name || 'Не указано',
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
