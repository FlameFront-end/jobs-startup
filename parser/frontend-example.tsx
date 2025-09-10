import React, { useEffect, useState } from 'react'

// Типы данных (можно вынести в отдельный файл)
interface CompanyInfo {
	name: string
	description?: string
	website?: string
	size?: string
	logo?: string
}

interface SalaryInfo {
	min?: number
	max?: number
	currency?: string
	period?: string
	type?: string
}

interface LocationInfo {
	city?: string
	country?: string
	address?: string
	remote?: boolean
}

interface Requirements {
	required: string[]
	preferred?: string[]
	technical?: string[]
	languages?: string[]
	frameworks?: string[]
	tools?: string[]
}

interface Benefits {
	social?: string[]
	bonuses?: string[]
	conditions?: string[]
	development?: string[]
}

enum WorkType {
	FULL_TIME = 'full_time',
	PART_TIME = 'part_time',
	CONTRACT = 'contract',
	INTERNSHIP = 'internship',
	REMOTE = 'remote',
	HYBRID = 'hybrid'
}

enum ExperienceLevel {
	NO_EXPERIENCE = 'no_experience',
	JUNIOR = 'junior',
	MIDDLE = 'middle',
	SENIOR = 'senior',
	LEAD = 'lead'
}

interface NormalizedJob {
	id: string
	title: string
	description: string
	company: CompanyInfo
	salary?: SalaryInfo
	location?: LocationInfo
	requirements: Requirements
	benefits?: Benefits
	workType: WorkType
	experienceLevel?: ExperienceLevel
	source: string
	sourceName: string
	originalUrl?: string
	publishedAt: string
	parsedAt: string
	qualityScore: number
	keywords?: string[]
}

interface JobsResponse {
	success: boolean
	data: NormalizedJob[]
	pagination: {
		total: number
		limit: number
		offset: number
		hasMore: boolean
	}
}

// Компонент карточки вакансии
const JobCard: React.FC<{ job: NormalizedJob }> = ({ job }) => {
	const formatSalary = (salary: SalaryInfo) => {
		if (!salary) return null

		const formatNumber = (num: number) => num.toLocaleString('ru-RU')

		if (salary.min && salary.max) {
			return `${formatNumber(salary.min)} - ${formatNumber(salary.max)} ${salary.currency}`
		} else if (salary.min) {
			return `от ${formatNumber(salary.min)} ${salary.currency}`
		} else if (salary.max) {
			return `до ${formatNumber(salary.max)} ${salary.currency}`
		}
		return null
	}

	const getWorkTypeLabel = (workType: WorkType) => {
		const labels = {
			[WorkType.FULL_TIME]: 'Полная занятость',
			[WorkType.PART_TIME]: 'Частичная занятость',
			[WorkType.CONTRACT]: 'Контракт',
			[WorkType.INTERNSHIP]: 'Стажировка',
			[WorkType.REMOTE]: 'Удаленно',
			[WorkType.HYBRID]: 'Гибрид'
		}
		return labels[workType] || workType
	}

	const getExperienceLabel = (level: ExperienceLevel) => {
		const labels = {
			[ExperienceLevel.NO_EXPERIENCE]: 'Без опыта',
			[ExperienceLevel.JUNIOR]: 'Junior',
			[ExperienceLevel.MIDDLE]: 'Middle',
			[ExperienceLevel.SENIOR]: 'Senior',
			[ExperienceLevel.LEAD]: 'Lead'
		}
		return labels[level] || level
	}

	const getQualityColor = (score: number) => {
		if (score >= 80) return 'text-green-600'
		if (score >= 60) return 'text-yellow-600'
		if (score >= 40) return 'text-orange-600'
		return 'text-red-600'
	}

	return (
		<div className='bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow'>
			{/* Заголовок и компания */}
			<div className='mb-4'>
				<h3 className='text-xl font-semibold text-gray-900 mb-2'>{job.title}</h3>
				<div className='flex items-center gap-2'>
					<h4 className='text-lg font-medium text-blue-600'>{job.company.name}</h4>
					{job.company.size && (
						<span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded'>{job.company.size}</span>
					)}
				</div>
			</div>

			{/* Зарплата */}
			{job.salary && (
				<div className='mb-4'>
					<div className='text-lg font-semibold text-green-600'>
						{formatSalary(job.salary)}
						{job.salary.period && ` / ${job.salary.period}`}
					</div>
				</div>
			)}

			{/* Локация */}
			{job.location && (
				<div className='mb-4'>
					<div className='flex items-center gap-2 text-gray-600'>
						<span>📍</span>
						<span>
							{job.location.city && job.location.country
								? `${job.location.city}, ${job.location.country}`
								: job.location.city || job.location.country}
						</span>
						{job.location.remote && (
							<span className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded'>Удаленно</span>
						)}
					</div>
				</div>
			)}

			{/* Требования */}
			<div className='mb-4'>
				<h5 className='font-semibold text-gray-900 mb-2'>Требования:</h5>
				<ul className='list-disc list-inside text-gray-700 mb-3'>
					{job.requirements.required.slice(0, 3).map((req, index) => (
						<li key={index}>{req}</li>
					))}
				</ul>

				{/* Технические навыки */}
				{job.requirements.technical && job.requirements.technical.length > 0 && (
					<div className='mb-3'>
						<h6 className='font-medium text-gray-900 mb-2'>Технологии:</h6>
						<div className='flex flex-wrap gap-2'>
							{job.requirements.technical.slice(0, 8).map((skill, index) => (
								<span key={index} className='bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded'>
									{skill}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Языки программирования */}
				{job.requirements.languages && job.requirements.languages.length > 0 && (
					<div className='mb-3'>
						<h6 className='font-medium text-gray-900 mb-2'>Языки:</h6>
						<div className='flex flex-wrap gap-2'>
							{job.requirements.languages.map((lang, index) => (
								<span key={index} className='bg-green-100 text-green-800 text-sm px-2 py-1 rounded'>
									{lang}
								</span>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Преимущества */}
			{job.benefits && (
				<div className='mb-4'>
					<h5 className='font-semibold text-gray-900 mb-2'>Преимущества:</h5>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
						{job.benefits.social?.slice(0, 4).map((benefit, index) => (
							<div key={index} className='flex items-center text-sm text-gray-600'>
								<span className='text-green-500 mr-2'>✓</span>
								{benefit}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Мета-информация */}
			<div className='flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4'>
				<span className='bg-gray-100 px-2 py-1 rounded'>{getWorkTypeLabel(job.workType)}</span>
				{job.experienceLevel && (
					<span className='bg-purple-100 text-purple-800 px-2 py-1 rounded'>
						{getExperienceLabel(job.experienceLevel)}
					</span>
				)}
				<span className={`font-medium ${getQualityColor(job.qualityScore)}`}>
					Качество: {job.qualityScore}%
				</span>
			</div>

			{/* Действия */}
			<div className='flex justify-between items-center'>
				<div className='text-xs text-gray-400'>
					{job.sourceName} • {new Date(job.publishedAt).toLocaleDateString('ru-RU')}
				</div>
				{job.originalUrl && (
					<a
						href={job.originalUrl}
						target='_blank'
						rel='noopener noreferrer'
						className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
					>
						Подробнее
					</a>
				)}
			</div>
		</div>
	)
}

// Основной компонент списка вакансий
const JobsList: React.FC = () => {
	const [jobs, setJobs] = useState<NormalizedJob[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [pagination, setPagination] = useState({
		total: 0,
		limit: 20,
		offset: 0,
		hasMore: false
	})
	const [filters, setFilters] = useState({
		minQuality: 50,
		source: '',
		keywords: ''
	})

	const fetchJobs = async (offset = 0) => {
		try {
			setLoading(true)
			const params = new URLSearchParams({
				limit: '20',
				offset: offset.toString(),
				minQuality: filters.minQuality.toString()
			})

			if (filters.source) params.append('source', filters.source)
			if (filters.keywords) params.append('keywords', filters.keywords)

			const response = await fetch(`/api/jobs/normalized?${params}`)
			const data: JobsResponse = await response.json()

			if (data.success) {
				if (offset === 0) {
					setJobs(data.data)
				} else {
					setJobs(prev => [...prev, ...data.data])
				}
				setPagination(data.pagination)
			} else {
				setError('Ошибка загрузки данных')
			}
		} catch (err) {
			setError('Ошибка сети')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchJobs(0)
	}, [filters])

	const handleLoadMore = () => {
		if (pagination.hasMore && !loading) {
			fetchJobs(pagination.offset + pagination.limit)
		}
	}

	const handleFilterChange = (key: string, value: string | number) => {
		setFilters(prev => ({ ...prev, [key]: value }))
	}

	if (error) {
		return (
			<div className='text-center py-8'>
				<div className='text-red-600 mb-4'>{error}</div>
				<button
					onClick={() => fetchJobs(0)}
					className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
				>
					Попробовать снова
				</button>
			</div>
		)
	}

	return (
		<div className='max-w-6xl mx-auto p-6'>
			<h1 className='text-3xl font-bold text-gray-900 mb-8'>Вакансии</h1>

			{/* Фильтры */}
			<div className='bg-gray-50 p-4 rounded-lg mb-6'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Минимальное качество</label>
						<select
							value={filters.minQuality}
							onChange={e => handleFilterChange('minQuality', parseInt(e.target.value))}
							className='w-full border border-gray-300 rounded px-3 py-2'
						>
							<option value={30}>30%+</option>
							<option value={50}>50%+</option>
							<option value={70}>70%+</option>
							<option value={90}>90%+</option>
						</select>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Источник</label>
						<select
							value={filters.source}
							onChange={e => handleFilterChange('source', e.target.value)}
							className='w-full border border-gray-300 rounded px-3 py-2'
						>
							<option value=''>Все источники</option>
							<option value='website'>Сайты</option>
							<option value='telegram'>Telegram</option>
						</select>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Ключевые слова</label>
						<input
							type='text'
							value={filters.keywords}
							onChange={e => handleFilterChange('keywords', e.target.value)}
							placeholder='react, javascript...'
							className='w-full border border-gray-300 rounded px-3 py-2'
						/>
					</div>
				</div>
			</div>

			{/* Статистика */}
			<div className='text-sm text-gray-600 mb-4'>
				Найдено {pagination.total} вакансий
				{filters.minQuality > 30 && ` (качество ${filters.minQuality}%+)`}
			</div>

			{/* Список вакансий */}
			{loading && jobs.length === 0 ? (
				<div className='text-center py-8'>
					<div className='text-gray-600'>Загрузка...</div>
				</div>
			) : (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{jobs.map(job => (
						<JobCard key={job.id} job={job} />
					))}
				</div>
			)}

			{/* Кнопка "Загрузить еще" */}
			{pagination.hasMore && (
				<div className='text-center mt-8'>
					<button
						onClick={handleLoadMore}
						disabled={loading}
						className='bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50'
					>
						{loading ? 'Загрузка...' : 'Загрузить еще'}
					</button>
				</div>
			)}
		</div>
	)
}

export default JobsList
