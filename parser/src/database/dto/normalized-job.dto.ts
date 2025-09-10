import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
	MinLength,
	ValidateNested
} from 'class-validator'

export enum WorkType {
	FULL_TIME = 'full_time',
	PART_TIME = 'part_time',
	CONTRACT = 'contract',
	INTERNSHIP = 'internship',
	REMOTE = 'remote',
	HYBRID = 'hybrid'
}

export enum ExperienceLevel {
	NO_EXPERIENCE = 'no_experience',
	JUNIOR = 'junior',
	MIDDLE = 'middle',
	SENIOR = 'senior',
	LEAD = 'lead'
}

export class CompanyInfo {
	@ApiProperty({ description: 'Название компании' })
	@IsString()
	@MinLength(1)
	@MaxLength(255)
	name: string

	@ApiPropertyOptional({ description: 'Описание компании' })
	@IsOptional()
	@IsString()
	@MaxLength(2000)
	description?: string

	@ApiPropertyOptional({ description: 'Сайт компании' })
	@IsOptional()
	@IsUrl()
	website?: string

	@ApiPropertyOptional({ description: 'Размер компании' })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	size?: string

	@ApiPropertyOptional({ description: 'Логотип компании' })
	@IsOptional()
	@IsUrl()
	logo?: string
}

export class SalaryInfo {
	@ApiPropertyOptional({ description: 'Минимальная зарплата' })
	@IsOptional()
	@IsNumber()
	min?: number

	@ApiPropertyOptional({ description: 'Максимальная зарплата' })
	@IsOptional()
	@IsNumber()
	max?: number

	@ApiPropertyOptional({ description: 'Валюта' })
	@IsOptional()
	@IsString()
	@MaxLength(10)
	currency?: string

	@ApiPropertyOptional({ description: 'Период (месяц, год)' })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	period?: string

	@ApiPropertyOptional({ description: 'Тип зарплаты (до вычета налогов, после)' })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	type?: string
}

export class LocationInfo {
	@ApiPropertyOptional({ description: 'Город' })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	city?: string

	@ApiPropertyOptional({ description: 'Страна' })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	country?: string

	@ApiPropertyOptional({ description: 'Адрес' })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	address?: string

	@ApiPropertyOptional({ description: 'Удаленная работа' })
	@IsOptional()
	@IsBoolean()
	remote?: boolean
}

export class Requirements {
	@ApiProperty({ description: 'Обязательные требования', type: [String] })
	@IsArray()
	@IsString({ each: true })
	required: string[]

	@ApiPropertyOptional({ description: 'Желательные требования', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	preferred?: string[]

	@ApiPropertyOptional({ description: 'Технические навыки', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	technical?: string[]

	@ApiPropertyOptional({ description: 'Языки программирования', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	languages?: string[]

	@ApiPropertyOptional({ description: 'Фреймворки и библиотеки', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	frameworks?: string[]

	@ApiPropertyOptional({ description: 'Инструменты и технологии', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tools?: string[]
}

export class Benefits {
	@ApiPropertyOptional({ description: 'Социальный пакет', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	social?: string[]

	@ApiPropertyOptional({ description: 'Дополнительные бонусы', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	bonuses?: string[]

	@ApiPropertyOptional({ description: 'Условия работы', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	conditions?: string[]

	@ApiPropertyOptional({ description: 'Возможности развития', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	development?: string[]
}

export class NormalizedJobDto {
	@ApiProperty({ description: 'ID вакансии' })
	@IsString()
	id: string

	@ApiProperty({ description: 'Заголовок вакансии' })
	@IsString()
	@MinLength(1)
	@MaxLength(500)
	title: string

	@ApiProperty({ description: 'Описание вакансии' })
	@IsString()
	@MinLength(1)
	description: string

	@ApiProperty({ description: 'Информация о компании', type: CompanyInfo })
	@ValidateNested()
	@Type(() => CompanyInfo)
	company: CompanyInfo

	@ApiPropertyOptional({ description: 'Информация о зарплате', type: SalaryInfo })
	@IsOptional()
	@ValidateNested()
	@Type(() => SalaryInfo)
	salary?: SalaryInfo

	@ApiPropertyOptional({ description: 'Информация о локации', type: LocationInfo })
	@IsOptional()
	@ValidateNested()
	@Type(() => LocationInfo)
	location?: LocationInfo

	@ApiProperty({ description: 'Требования', type: Requirements })
	@ValidateNested()
	@Type(() => Requirements)
	requirements: Requirements

	@ApiPropertyOptional({ description: 'Преимущества и бонусы', type: Benefits })
	@IsOptional()
	@ValidateNested()
	@Type(() => Benefits)
	benefits?: Benefits

	@ApiProperty({ description: 'Тип работы', enum: WorkType })
	@IsEnum(WorkType)
	workType: WorkType

	@ApiPropertyOptional({ description: 'Уровень опыта', enum: ExperienceLevel })
	@IsOptional()
	@IsEnum(ExperienceLevel)
	experienceLevel?: ExperienceLevel

	@ApiProperty({ description: 'Источник вакансии' })
	@IsString()
	source: string

	@ApiProperty({ description: 'Название источника' })
	@IsString()
	sourceName: string

	@ApiPropertyOptional({ description: 'Оригинальная ссылка' })
	@IsOptional()
	@IsUrl()
	originalUrl?: string

	@ApiProperty({ description: 'Дата публикации' })
	publishedAt: Date

	@ApiProperty({ description: 'Дата парсинга' })
	parsedAt: Date

	@ApiProperty({ description: 'Качество данных (0-100)' })
	@IsNumber()
	qualityScore: number

	@ApiPropertyOptional({ description: 'Ключевые слова', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	keywords?: string[]
}
