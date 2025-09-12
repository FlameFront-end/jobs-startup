export interface ApiResponse<T = any> {
	data: T
	message?: string
	success: boolean
}

export interface ApiError {
	message: string
	status: number
	code?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export interface Job {
	id: string
	title: string
	company: string
	location: string
	salaryMin?: number
	salaryMax?: number
	description: string
	requirements: string[]
	benefits: string[]
	employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
	experienceLevel: 'junior' | 'middle' | 'senior' | 'lead'
	remote: boolean
	createdAt: string
	updatedAt: string
}

export interface User {
	id: string
	email: string
	name: string
	avatar?: string
	role: 'user' | 'admin' | 'moderator'
	createdAt: string
	updatedAt: string
}

export interface AuthResponse {
	user: User
	token: string
	refreshToken: string
}

export interface LoginRequest {
	email: string
	password: string
}

export interface RegisterRequest {
	email: string
	password: string
	name: string
}

export interface JobFilters {
	search?: string
	location?: string
	employmentType?: string
	experienceLevel?: string
	remote?: boolean
	salaryMin?: number
	salaryMax?: number
	page?: number
	limit?: number
}
