import { Injectable } from '@nestjs/common'

@Injectable()
export class TextProcessorService {
	/**
	 * Нормализует заголовок вакансии
	 */
	normalizeTitle(title: string): string {
		if (!title) return 'Без заголовка'

		return title
			.trim()
			.replace(/\s+/g, ' ')
			.replace(/[^\w\s\-.,!?()а-яёА-ЯЁ]/g, '') // Сохраняем кириллицу
			.replace(/\s+/g, ' ')
			.substring(0, 500)
	}

	/**
	 * Нормализует описание вакансии
	 */
	normalizeDescription(description: string): string {
		if (!description) return ''

		return description
			.trim()
			.replace(/\s+/g, ' ')
			.replace(/[^\w\s\-.,!?()\nа-яёА-ЯЁ]/g, '') // Сохраняем кириллицу
			.replace(/\n\s*\n/g, '\n') // Убираем пустые строки
			.replace(/\s+/g, ' ')
			.substring(0, 5000)
	}

	/**
	 * Создает хеш контента для дедупликации
	 */
	createContentHash(title: string, description: string): string {
		const safeTitle = title || ''
		const safeDescription = description || ''
		const content = `${safeTitle} ${safeDescription}`.toLowerCase().trim()

		// Простой хеш для демонстрации
		let hash = 0
		for (let i = 0; i < content.length; i++) {
			const char = content.charCodeAt(i)
			hash = (hash << 5) - hash + char
			hash = hash & hash // Convert to 32bit integer
		}

		return Math.abs(hash).toString(16)
	}

	/**
	 * Извлекает ключевые слова из текста
	 */
	extractKeywords(text: string, customKeywords?: string[]): string[] {
		if (!text || typeof text !== 'string') {
			return []
		}

		const keywords = new Set<string>()

		// Добавляем пользовательские ключевые слова
		if (customKeywords) {
			customKeywords.forEach(keyword => {
				if (keyword && keyword.trim()) {
					keywords.add(keyword.toLowerCase().trim())
				}
			})
		}

		// Извлекаем слова из текста
		const words = text
			.toLowerCase()
			.replace(/[^\w\s]/g, ' ')
			.split(/\s+/)
			.filter(word => word.length > 3)

		// Добавляем часто встречающиеся слова
		const wordCount = new Map<string, number>()
		words.forEach(word => {
			wordCount.set(word, (wordCount.get(word) || 0) + 1)
		})

		// Добавляем слова, которые встречаются больше одного раза
		wordCount.forEach((count, word) => {
			if (count > 1 && word.length > 3) {
				keywords.add(word)
			}
		})

		return Array.from(keywords).slice(0, 20) // Ограничиваем количество ключевых слов
	}
}
