import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Job } from '../../database/entities'

@Injectable()
export class JobCacheService {
	private readonly logger = new Logger(JobCacheService.name)
	private readonly duplicateCache = new Set<string>()
	private cacheExpiry = 0
	private readonly CACHE_TTL = 5 * 60 * 1000 // 5 минут

	constructor(
		@InjectRepository(Job)
		private jobRepository: Repository<Job>
	) {}

	async checkJobsExist(contentHashes: string[]): Promise<Set<string>> {
		if (contentHashes.length === 0) {
			return new Set()
		}

		const now = Date.now()
		if (now > this.cacheExpiry) {
			this.duplicateCache.clear()
			this.cacheExpiry = now + this.CACHE_TTL
		}

		const knownDuplicates = contentHashes.filter(hash => this.duplicateCache.has(hash))
		const unknownHashes = contentHashes.filter(hash => !this.duplicateCache.has(hash))

		if (unknownHashes.length === 0) {
			return new Set(knownDuplicates)
		}

		try {
			const existingJobs = await this.jobRepository.find({
				where: { contentHash: In(unknownHashes) },
				select: ['contentHash']
			})

			existingJobs.forEach(job => this.duplicateCache.add(job.contentHash))

			const allDuplicates = [...knownDuplicates, ...existingJobs.map(job => job.contentHash)]
			return new Set(allDuplicates)
		} catch (error) {
			this.logger.error('Error checking job existence:', error)
			return new Set(knownDuplicates)
		}
	}

	async jobExists(contentHash: string): Promise<boolean> {
		try {
			const existingJob = await this.jobRepository.findOne({
				where: { contentHash },
				select: ['id']
			})
			return !!existingJob
		} catch (error) {
			this.logger.error('Error checking single job existence:', error)
			return false
		}
	}

	addToCache(contentHash: string): void {
		this.duplicateCache.add(contentHash)
	}

	clearCache(): void {
		this.duplicateCache.clear()
		this.cacheExpiry = 0
	}

	getCacheSize(): number {
		return this.duplicateCache.size
	}
}
