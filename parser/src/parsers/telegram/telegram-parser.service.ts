import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TextProcessorService } from '../../common/text-processor.service'
import { CreateJobDto, JobSource } from '../../database/dto/job.dto'
import { JobsService } from '../../jobs/jobs.service'

export interface TelegramChannel {
	id: string
	username: string
	name: string
	keywords?: string[]
	enabled: boolean
}

export interface ParsingResult {
	success: boolean
	jobsCount: number
	errorMessage?: string
}

@Injectable()
export class TelegramParserService {
	private readonly logger = new Logger(TelegramParserService.name)
	private channels: TelegramChannel[] = []

	constructor(
		private configService: ConfigService,
		private textProcessor: TextProcessorService,
		private jobsService: JobsService
	) {
		this.initializeChannels()
	}

	private initializeChannels() {
		// Пример конфигурации каналов
		this.channels = [
			{
				id: 'example_channel_id',
				username: 'example_channel',
				name: 'Example Job Channel',
				keywords: ['работа', 'вакансия', 'frontend', 'backend', 'developer'],
				enabled: true
			}
		]
	}

	async parseAllChannels(): Promise<ParsingResult> {
		this.logger.log('📱 Starting Telegram parsing process...')
		const allJobs: CreateJobDto[] = []
		let totalErrors = 0
		const startTime = Date.now()

		for (const channel of this.channels.filter(c => c.enabled)) {
			try {
				const jobs = await this.parseChannel(channel)
				allJobs.push(...jobs)
				this.logger.log(`✅ ${channel.name}: Found ${jobs.length} jobs`)
			} catch (error) {
				totalErrors++
				this.logger.error(`❌ Failed to parse channel ${channel.name}:`, error)
			}
		}

		// Фильтруем дубликаты перед сохранением
		let savedJobs = 0
		let skippedJobs = 0
		if (allJobs.length > 0) {
			// Проверяем дубликаты батчево
			const contentHashes = allJobs.map(job => job.contentHash)
			const existingHashes = await this.jobsService.checkJobsExist(contentHashes)

			// Фильтруем только новые вакансии
			const newJobs = allJobs.filter(job => !existingHashes.has(job.contentHash))
			skippedJobs = allJobs.length - newJobs.length

			this.logger.log(`Найдено ${allJobs.length} вакансий, ${skippedJobs} дубликатов, ${newJobs.length} новых`)

			if (newJobs.length > 0) {
				const result = await this.jobsService.saveJobs(newJobs)
				savedJobs = result.saved
				skippedJobs += result.skipped
			}
		}

		const duration = Date.now() - startTime
		const result = {
			success: totalErrors === 0,
			jobsCount: allJobs.length,
			errorMessage: totalErrors > 0 ? `Failed to parse ${totalErrors} channels` : undefined
		}

		// Подробный лог результатов парсинга
		this.logger.log(`📊 TELEGRAM PARSING COMPLETED:`)
		this.logger.log(`   ⏱️  Duration: ${duration}ms`)
		this.logger.log(`   📋 Total jobs found: ${allJobs.length}`)
		this.logger.log(`   💾 Saved to database: ${savedJobs}`)
		this.logger.log(`   ⏭️  Skipped duplicates: ${skippedJobs}`)
		this.logger.log(`   ❌ Errors: ${totalErrors}`)
		this.logger.log(`   ✅ Success: ${result.success ? 'YES' : 'NO'}`)

		return result
	}

	private async parseChannel(channel: TelegramChannel): Promise<CreateJobDto[]> {
		// Временная заглушка - в реальном проекте здесь будет интеграция с Telegram API
		this.logger.warn('Telegram parser is not fully implemented - using mock data')

		// Возвращаем пример данных для демонстрации
		return [
			{
				source: JobSource.TELEGRAM,
				sourceName: channel.name,
				title: 'Frontend Developer (React)',
				description: 'Ищем опытного Frontend разработчика на React для работы в команде',
				originalUrl: `https://t.me/${channel.username}/123`,
				publishedAt: new Date().toISOString(),
				contentHash: this.textProcessor.createContentHash(
					'Frontend Developer (React)',
					'Ищем опытного Frontend разработчика на React для работы в команде'
				),
				keywords: this.textProcessor.extractKeywords('Frontend Developer React разработчик', channel.keywords)
			}
		]
	}
}
