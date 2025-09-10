import { Injectable } from '@nestjs/common'
import { Page } from 'puppeteer'
import { TextProcessorService } from '../../../common/text-processor.service'
import { CreateJobDto } from '../../../database/dto/job.dto'
import { ParserConfig } from '../config/parser-config'
import { BaseParser } from './base-parser'

@Injectable()
export class HHParser extends BaseParser {
	constructor(textProcessor: TextProcessorService) {
		super(textProcessor)
	}

	async parse(page: Page, config: ParserConfig): Promise<CreateJobDto[]> {
		await this.waitForContent(page, '[data-qa*="vacancy-serp__vacancy"]')

		const jobs = await this.extractJobsFromPage(page, config)
		const processedJobs = jobs
			.map(job => this.processJobData(job, config))
			.filter(job => job !== null) as CreateJobDto[]

		return processedJobs
	}
}
