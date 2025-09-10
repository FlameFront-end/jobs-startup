import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('parsing_logs')
export class ParsingLog {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({ type: 'varchar', length: 50 })
	source: string

	@Column({ type: 'varchar', length: 255 })
	sourceName: string

	@Column({ type: 'boolean' })
	success: boolean

	@Column({ type: 'int', default: 0 })
	jobsCount: number

	@Column({ type: 'text', nullable: true })
	errorMessage?: string

	@CreateDateColumn()
	parsedAt: Date
}
