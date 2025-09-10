import { Injectable, Logger } from '@nestjs/common'
import { CreateJobDto, JobSource } from '../../database/dto/job.dto'
import { JobsService } from '../../jobs/jobs.service'
import { PARSER_CONFIGS, ParserConfig, ParserSite } from './config/parser-config'
import { ParserFactory } from './factories/parser-factory'
import { BrowserService } from './services/browser.service'
import { HtmlExtractorService } from './services/html-extractor.service'

export interface ParsingResult {
	success: boolean
	jobsCount: number
	errorMessage?: string
}

@Injectable()
export class WebsiteParserService {
	private readonly logger = new Logger(WebsiteParserService.name)

	constructor(
		private jobsService: JobsService,
		private browserService: BrowserService,
		private parserFactory: ParserFactory,
		private htmlExtractor: HtmlExtractorService
	) {}

	async parseAll(): Promise<ParsingResult> {
		return this.parseBySite(ParserSite.ALL)
	}

	async parseBySite(site: ParserSite): Promise<ParsingResult> {
		this.logger.log(`🚀 Starting website parsing process for: ${site}`)
		const allJobs: CreateJobDto[] = []
		let totalErrors = 0
		const startTime = Date.now()

		const configsToParse =
			site === ParserSite.ALL ? PARSER_CONFIGS : PARSER_CONFIGS.filter(config => config.site === site)

		if (configsToParse.length === 0) {
			this.logger.warn(`❌ No configurations found for site: ${site}`)
			return {
				success: false,
				jobsCount: 0,
				errorMessage: `No configurations found for site: ${site}`
			}
		}

		for (const config of configsToParse) {
			try {
				const jobs = await this.parseWebsite(config)
				allJobs.push(...jobs)
				this.logger.log(`✅ ${config.name}: Found ${jobs.length} jobs`)
			} catch (error) {
				totalErrors++
				this.logger.error(`❌ Failed to parse ${config.name}:`, error.message)
			}
		}

		let savedJobs = 0
		let skippedJobs = 0
		if (allJobs.length > 0) {
			const contentHashes = allJobs.map(job => job.contentHash)
			const existingHashes = await this.jobsService.checkJobsExist(contentHashes)

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
			errorMessage: totalErrors > 0 ? `Failed to parse ${totalErrors} websites` : undefined
		}

		this.logger.log(`📊 WEBSITE PARSING COMPLETED for ${site}:`)
		this.logger.log(`   ⏱️  Duration: ${duration}ms`)
		this.logger.log(`   📋 Total jobs found: ${allJobs.length}`)
		this.logger.log(`   💾 Saved to database: ${savedJobs}`)
		this.logger.log(`   ⏭️  Skipped duplicates: ${skippedJobs}`)
		this.logger.log(`   ❌ Errors: ${totalErrors}`)
		this.logger.log(`   ✅ Success: ${result.success ? 'YES' : 'NO'}`)

		return result
	}

	getAvailableSites(): { site: ParserSite; name: string }[] {
		return PARSER_CONFIGS.map(config => ({
			site: config.site,
			name: config.name
		}))
	}

	private async parseWebsite(config: ParserConfig): Promise<CreateJobDto[]> {
		if (config.type === 'static') {
			return this.parseStaticWebsite(config)
		} else {
			return this.parseDynamicWebsite(config)
		}
	}

	private async parseStaticWebsite(config: ParserConfig): Promise<CreateJobDto[]> {
		const html = await this.htmlExtractor.fetchPage(config.url)
		const extractedJobs = this.htmlExtractor.extractJobsFromHtml(html, config)
		return extractedJobs.map(job => this.processJobData(job, config))
	}

	private async parseDynamicWebsite(config: ParserConfig): Promise<CreateJobDto[]> {
		const page = await this.browserService.createPage()

		try {
			await page.goto(config.url, { waitUntil: 'networkidle2' })
			const parser = this.parserFactory.createParser(config)
			return await parser.parse(page, config)
		} finally {
			await page.close()
		}
	}

	private processJobData(jobData: any, config: ParserConfig): CreateJobDto {
		const textProcessor = this.parserFactory['textProcessor']
		const title = textProcessor.normalizeTitle(jobData.title)
		const description = textProcessor.normalizeDescription(jobData.description)
		const contentHash = textProcessor.createContentHash(title, description)
		const keywords = textProcessor.extractKeywords(`${title} ${description}`, config.keywords)

		return {
			source: JobSource.WEBSITE,
			sourceName: config.name,
			title,
			description,
			originalUrl: jobData.originalUrl,
			publishedAt: new Date().toISOString(),
			contentHash,
			keywords
		}
	}

	async onModuleDestroy() {
		await this.browserService.onModuleDestroy()
	}
}
