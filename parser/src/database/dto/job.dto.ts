import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsArray,
	IsDateString,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
	IsUrl,
	MaxLength,
	MinLength
} from 'class-validator'

export enum JobSource {
	WEBSITE = 'website',
	TELEGRAM = 'telegram'
}

export class CreateJobDto {
	@ApiProperty({ description: 'Источник вакансии', enum: JobSource })
	@IsEnum(JobSource)
	source: JobSource

	@ApiProperty({ description: 'Название источника', example: 'HH.ru' })
	@IsString()
	@MinLength(1)
	@MaxLength(255)
	sourceName: string

	@ApiProperty({ description: 'Заголовок вакансии', example: 'Frontend Developer' })
	@IsString()
	@MinLength(1)
	@MaxLength(500)
	title: string

	@ApiProperty({ description: 'Описание вакансии' })
	@IsString()
	@MinLength(1)
	description: string

	@ApiPropertyOptional({ description: 'Оригинальная ссылка на вакансию' })
	@IsOptional()
	@IsUrl()
	originalUrl?: string

	@ApiProperty({ description: 'Дата публикации', example: '2024-01-15T10:30:00.000Z' })
	@IsDateString()
	publishedAt: string

	@ApiProperty({ description: 'Хеш контента для дедупликации' })
	@IsString()
	@MinLength(1)
	@MaxLength(64)
	contentHash: string

	@ApiPropertyOptional({ description: 'Ключевые слова', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	keywords?: string[]
}

export class UpdateJobDto {
	@ApiPropertyOptional({ description: 'Заголовок вакансии' })
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(500)
	title?: string

	@ApiPropertyOptional({ description: 'Описание вакансии' })
	@IsOptional()
	@IsString()
	@MinLength(1)
	description?: string

	@ApiPropertyOptional({ description: 'Оригинальная ссылка на вакансию' })
	@IsOptional()
	@IsUrl()
	originalUrl?: string

	@ApiPropertyOptional({ description: 'Ключевые слова', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	keywords?: string[]
}

export class JobQueryDto {
	@ApiPropertyOptional({ description: 'Фильтр по источнику', enum: JobSource })
	@IsOptional()
	@IsEnum(JobSource)
	source?: JobSource

	@ApiPropertyOptional({ description: 'Фильтр по названию источника' })
	@IsOptional()
	@IsString()
	sourceName?: string

	@ApiPropertyOptional({ description: 'Фильтр по ключевым словам', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Type(() => String)
	keywords?: string[]

	@ApiPropertyOptional({ description: 'Дата начала периода' })
	@IsOptional()
	@IsDateString()
	м
	dateFrom?: string

	@ApiPropertyOptional({ description: 'Дата окончания периода' })
	@IsOptional()
	@IsDateString()
	dateTo?: string

	@ApiPropertyOptional({
		description: 'Количество записей на страницу',
		minimum: 1,
		maximum: 100,
		default: 20
	})
	@IsOptional()
	@Type(() => Number)
	limit?: number = 20

	@ApiPropertyOptional({ description: 'Смещение для пагинации', minimum: 0, default: 0 })
	@IsOptional()
	@Type(() => Number)
	offset?: number = 0
}

export class JobResponseDto {
	@ApiProperty({ description: 'ID вакансии' })
	@IsUUID()
	id: string

	@ApiProperty({ description: 'Источник вакансии', enum: JobSource })
	source: JobSource

	@ApiProperty({ description: 'Название источника' })
	sourceName: string

	@ApiProperty({ description: 'Заголовок вакансии' })
	title: string

	@ApiProperty({ description: 'Описание вакансии' })
	description: string

	@ApiPropertyOptional({ description: 'Оригинальная ссылка на вакансию' })
	originalUrl?: string

	@ApiProperty({ description: 'Дата публикации' })
	publishedAt: Date

	@ApiProperty({ description: 'Дата парсинга' })
	parsedAt: Date

	@ApiProperty({ description: 'Хеш контента' })
	contentHash: string

	@ApiPropertyOptional({ description: 'Ключевые слова', type: [String] })
	keywords?: string[]

	@ApiProperty({ description: 'Дата обновления' })
	updatedAt: Date
}
