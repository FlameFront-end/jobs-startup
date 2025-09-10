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
	async normalizeJob(job: CreateJobDto): Promise<NormalizedJobDto | null> {
		try {
			this.logger.debug(`Начинаем нормализацию вакансии: "${job.title}"`)

			// Используем ИИ для нормализации
			const aiResponse = await this.aiService.normalizeJobWithAI(job.title, job.description)

			if (!aiResponse) {
				this.logger.warn(`ИИ не смог нормализовать вакансию "${job.title}"`)
				return null
			}

			// Преобразуем ответ ИИ в наш формат
			const company: CompanyInfo = {
				name: aiResponse.company.name,
				description: aiResponse.company.description,
				website: aiResponse.company.website,
				size: aiResponse.company.size
			}

			const salary: SalaryInfo | undefined = aiResponse.salary
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
				this.logger.warn(`Пропускаем вакансию "${job.title}" - низкое качество данных: ${qualityScore}`)
				return null
			}

			const normalizedJob: NormalizedJobDto = {
				id: job.contentHash,
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

			this.logger.debug(`Успешно нормализована вакансия "${job.title}" с качеством ${qualityScore}%`)
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

	private extractCompanyInfo(text: string, description: string): CompanyInfo {
		const company: CompanyInfo = {
			name: this.extractCompanyName(text, description)
		}

		// Извлекаем описание компании
		const companyDescPatterns = [/компания\s+([^.!?]+)/i, /мы\s+([^.!?]+)/i, /наша\s+компания\s+([^.!?]+)/i]

		for (const pattern of companyDescPatterns) {
			const match = description.match(pattern)
			if (match && match[1]) {
				company.description = match[1].trim()
				break
			}
		}

		// Извлекаем размер компании
		const sizePatterns = [/(\d+)\s*-\s*(\d+)\s*сотрудников/i, /(\d+)\s*сотрудников/i, /команда\s+из\s+(\d+)/i]

		for (const pattern of sizePatterns) {
			const match = text.match(pattern)
			if (match) {
				company.size = match[0]
				break
			}
		}

		return company
	}

	private extractCompanyName(text: string, description: string): string {
		// Паттерны для поиска названия компании
		const patterns = [
			/компания\s+([а-яё\w\s&.-]+)/i,
			/в\s+компании\s+([а-яё\w\s&.-]+)/i,
			/работа\s+в\s+([а-яё\w\s&.-]+)/i,
			/ищем\s+в\s+([а-яё\w\s&.-]+)/i
		]

		for (const pattern of patterns) {
			const match = description.match(pattern)
			if (match && match[1]) {
				return match[1].trim()
			}
		}

		// Если не нашли, возвращаем "Не указано"
		return 'Не указано'
	}

	private extractSalaryInfo(text: string): SalaryInfo | undefined {
		const salaryPatterns = [
			/(\d+)\s*-\s*(\d+)\s*(\d{3})\s*руб/i,
			/(\d+)\s*-\s*(\d+)\s*тыс/i,
			/от\s*(\d+)\s*(\d{3})?\s*руб/i,
			/до\s*(\d+)\s*(\d{3})?\s*руб/i,
			/(\d+)\s*(\d{3})\s*руб/i
		]

		for (const pattern of salaryPatterns) {
			const match = text.match(pattern)
			if (match) {
				const salary: SalaryInfo = {
					currency: 'RUB',
					period: 'month'
				}

				if (match[1] && match[2]) {
					// Диапазон зарплат
					salary.min = parseInt(match[1]) * (match[2].length === 3 ? 1000 : 1)
					salary.max = parseInt(match[2]) * (match[2].length === 3 ? 1000 : 1)
				} else if (match[1]) {
					// Одна сумма
					salary.min = parseInt(match[1]) * (match[2]?.length === 3 ? 1000 : 1)
				}

				return salary
			}
		}

		return undefined
	}

	private extractLocationInfo(text: string): LocationInfo | undefined {
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

		const location: LocationInfo = {
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

		return Object.keys(location).length > 1 ? location : undefined
	}

	private extractRequirements(text: string): Requirements {
		const requirements: Requirements = {
			required: [],
			preferred: [],
			technical: [],
			languages: [],
			frameworks: [],
			tools: []
		}

		// Технические навыки
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

		// Языки программирования
		const programmingLanguages = [
			'javascript',
			'typescript',
			'python',
			'java',
			'c#',
			'php',
			'ruby',
			'go',
			'rust',
			'c++',
			'c',
			'swift',
			'kotlin',
			'scala',
			'r',
			'matlab'
		]

		programmingLanguages.forEach(lang => {
			if (text.includes(lang)) {
				requirements.languages?.push(lang)
			}
		})

		// Фреймворки
		const frameworks = [
			'react',
			'vue',
			'angular',
			'svelte',
			'ember',
			'express',
			'nestjs',
			'fastapi',
			'django',
			'flask',
			'rails',
			'spring',
			'laravel',
			'symfony',
			'asp.net'
		]

		frameworks.forEach(framework => {
			if (text.includes(framework)) {
				requirements.frameworks?.push(framework)
			}
		})

		// Инструменты
		const tools = [
			'git',
			'docker',
			'kubernetes',
			'jenkins',
			'github actions',
			'aws',
			'azure',
			'gcp',
			'terraform',
			'ansible',
			'figma',
			'sketch',
			'photoshop',
			'illustrator'
		]

		tools.forEach(tool => {
			if (text.includes(tool)) {
				requirements.tools?.push(tool)
			}
		})

		// Общие требования
		const commonRequirements = [
			'опыт работы',
			'знание',
			'умение',
			'навыки',
			'понимание',
			'ответственность',
			'коммуникабельность',
			'командная работа'
		]

		commonRequirements.forEach(req => {
			if (text.includes(req)) {
				requirements.required.push(req)
			}
		})

		return requirements
	}

	private extractBenefits(text: string): Benefits {
		const benefits: Benefits = {
			social: [],
			bonuses: [],
			conditions: [],
			development: []
		}

		// Социальный пакет
		const socialBenefits = [
			'медицинская страховка',
			'дмс',
			'отпуск',
			'больничный',
			'пенсионные взносы',
			'материнский капитал',
			'детский сад'
		]

		socialBenefits.forEach(benefit => {
			if (text.includes(benefit)) {
				benefits.social?.push(benefit)
			}
		})

		// Бонусы
		const bonuses = [
			'премия',
			'бонус',
			'комиссия',
			'процент',
			'акции',
			'опционы',
			'13-я зарплата',
			'годовая премия'
		]

		bonuses.forEach(bonus => {
			if (text.includes(bonus)) {
				benefits.bonuses?.push(bonus)
			}
		})

		// Условия работы
		const conditions = [
			'гибкий график',
			'удаленная работа',
			'офис',
			'коворкинг',
			'командировки',
			'переработки',
			'сверхурочные'
		]

		conditions.forEach(condition => {
			if (text.includes(condition)) {
				benefits.conditions?.push(condition)
			}
		})

		// Развитие
		const development = [
			'обучение',
			'курсы',
			'конференции',
			'сертификация',
			'менторство',
			'карьерный рост',
			'повышение квалификации'
		]

		development.forEach(dev => {
			if (text.includes(dev)) {
				benefits.development?.push(dev)
			}
		})

		return benefits
	}

	private determineWorkType(text: string): WorkType {
		if (text.includes('удаленн') || text.includes('remote')) {
			return WorkType.REMOTE
		}
		if (text.includes('гибридн') || text.includes('hybrid')) {
			return WorkType.HYBRID
		}
		if (text.includes('стажировк') || text.includes('intern')) {
			return WorkType.INTERNSHIP
		}
		if (text.includes('частичн') || text.includes('part-time')) {
			return WorkType.PART_TIME
		}
		if (text.includes('контракт') || text.includes('contract')) {
			return WorkType.CONTRACT
		}
		return WorkType.FULL_TIME
	}

	private determineExperienceLevel(text: string): ExperienceLevel | undefined {
		if (text.includes('без опыта') || text.includes('junior') || text.includes('стажер')) {
			return ExperienceLevel.NO_EXPERIENCE
		}
		if (text.includes('1-3 года') || text.includes('1-2 года') || text.includes('до 3 лет')) {
			return ExperienceLevel.JUNIOR
		}
		if (text.includes('3-5 лет') || text.includes('от 3 лет') || text.includes('middle')) {
			return ExperienceLevel.MIDDLE
		}
		if (text.includes('5+ лет') || text.includes('от 5 лет') || text.includes('senior')) {
			return ExperienceLevel.SENIOR
		}
		if (text.includes('lead') || text.includes('руководитель') || text.includes('team lead')) {
			return ExperienceLevel.LEAD
		}
		return undefined
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
		if (data.company.name && data.company.name !== 'Не указано') score += 20
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
		// Извлекаем предложения с ключевыми обязанностями и технологиями
		const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10)

		// Ищем предложения с ключевыми словами обязанностей и технологий
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

		const relevantSentences = sentences.filter(sentence =>
			dutyKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
		)

		// Берем первые 3-4 релевантных предложения или первые 3-4 предложения
		const selectedSentences = relevantSentences.length > 0 ? relevantSentences.slice(0, 3) : sentences.slice(0, 3)

		// Если предложения слишком короткие, добавляем еще
		if (selectedSentences.length < 3) {
			const additionalSentences = sentences
				.filter(s => !selectedSentences.includes(s))
				.slice(0, 3 - selectedSentences.length)
			selectedSentences.push(...additionalSentences)
		}

		return (
			selectedSentences
				.map(s => s.trim())
				.filter(s => s.length > 0)
				.join('. ') + '.'
		)
	}

	private createFullDescription(description: string): string {
		// Очищаем и структурируем описание
		const cleaned = description
			.replace(/\s+/g, ' ') // Убираем лишние пробелы
			.replace(/([.!?])\s*([А-ЯЁ])/g, '$1 $2') // Добавляем пробелы после точек
			.replace(/([а-яё])([А-ЯЁ])/g, '$1. $2') // Добавляем точки между предложениями
			.replace(/([а-яё])([А-ЯЁ])/g, '$1. $2') // Дополнительная очистка
			.replace(/([.!?])([А-ЯЁ])/g, '$1 $2') // Пробелы после знаков препинания
			.trim()

		// Разбиваем на абзацы по ключевым словам разделов
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

		// Ищем разделы
		let structured = cleaned
		sectionKeywords.forEach(keyword => {
			const regex = new RegExp(`(${keyword}[^.!?]*[.!?])`, 'gi')
			structured = structured.replace(regex, '\n\n$1')
		})

		// Очищаем лишние пробелы и переносы
		structured = structured
			.replace(/\n\s*\n\s*\n/g, '\n\n') // Убираем множественные переносы
			.replace(/^\s+|\s+$/gm, '') // Убираем пробелы в начале и конце строк
			.trim()

		// Если получилось структурированное описание, возвращаем его
		if (structured.split('\n\n').length > 2) {
			return structured
		}

		// Иначе просто очищаем и возвращаем оригинальный текст
		return cleaned
	}
}
