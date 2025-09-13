import { z } from 'zod'

export const loginSchema = z.object({
	email: z.string().min(1, 'Email обязателен').email('Неверный формат email').max(255, 'Email слишком длинный'),
	password: z.string().min(6, 'Пароль должен содержать минимум 6 символов').max(128, 'Пароль слишком длинный')
})

export const registerSchema = z.object({
	email: z.string().min(1, 'Email обязателен').email('Неверный формат email').max(255, 'Email слишком длинный'),
	password: z.string().min(6, 'Пароль должен содержать минимум 6 символов').max(128, 'Пароль слишком длинный'),
	name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50, 'Имя слишком длинное')
})

export const jobFiltersSchema = z.object({
	search: z.string().optional(),
	location: z.string().optional(),
	employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
	experienceLevel: z.enum(['junior', 'middle', 'senior', 'lead']).optional(),
	remote: z.boolean().optional(),
	salaryMin: z.number().min(0, 'Минимальная зарплата не может быть отрицательной').optional(),
	salaryMax: z.number().min(0, 'Максимальная зарплата не может быть отрицательной').optional(),
	page: z.number().min(1, 'Страница должна быть больше 0').optional(),
	limit: z.number().min(1, 'Лимит должен быть больше 0').max(100, 'Лимит не может быть больше 100').optional()
})

export const profileUpdateSchema = z.object({
	name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50, 'Имя слишком длинное').optional(),
	avatar: z.string().url('Неверный формат URL аватара').optional()
})

export const settingsSchema = z.object({
	theme: z.enum(['light', 'dark', 'auto']).optional(),
	animationsEnabled: z.boolean().optional(),
	errorNotificationsEnabled: z.boolean().optional(),
	sidebarCollapsed: z.boolean().optional()
})

export const jobApplicationSchema = z.object({
	jobId: z.string().min(1, 'ID вакансии обязателен'),
	coverLetter: z.string().max(2000, 'Сопроводительное письмо слишком длинное').optional(),
	resume: z.string().url('Неверный формат URL резюме').optional()
})

export const paginationSchema = z.object({
	page: z.number().min(1, 'Страница должна быть больше 0').default(1),
	limit: z.number().min(1, 'Лимит должен быть больше 0').max(100, 'Лимит не может быть больше 100').default(10)
})

export const searchSchema = z.object({
	query: z.string().min(1, 'Поисковый запрос не может быть пустым').max(100, 'Поисковый запрос слишком длинный'),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(10)
})
