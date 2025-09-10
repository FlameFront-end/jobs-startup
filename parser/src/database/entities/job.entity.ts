import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('jobs')
export class Job {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({ type: 'varchar', length: 50 })
	source: string // "website" или "telegram"

	@Column({ type: 'varchar', length: 255 })
	sourceName: string // название сайта или канала

	@Column({ type: 'varchar', length: 500 })
	title: string

	@Column({ type: 'text' })
	description: string

	@Column({ type: 'varchar', length: 1000, nullable: true })
	originalUrl?: string

	@Column({ type: 'timestamp' })
	publishedAt: Date

	@CreateDateColumn()
	parsedAt: Date

	@Column({ type: 'varchar', length: 64, unique: true })
	@Index()
	contentHash: string // для дедупликации

	@Column({ type: 'jsonb', nullable: true })
	keywords?: string[] // ключевые слова для фильтрации

	// Нормализованные данные
	@Column({ type: 'jsonb', nullable: true })
	normalizedData?: any // структурированные данные вакансии

	@Column({ type: 'int', default: 0 })
	qualityScore: number // качество данных (0-100)

	@Column({ type: 'boolean', default: false })
	isNormalized: boolean // флаг нормализации

	@UpdateDateColumn()
	updatedAt: Date
}
