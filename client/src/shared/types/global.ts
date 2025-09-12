import type { Job, JobFilters, User } from './api'

export type Theme = 'light' | 'dark'

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship'

export type ExperienceLevel = 'junior' | 'middle' | 'senior' | 'lead'

export type UserRole = 'user' | 'admin' | 'moderator'

export interface AppState {
	animationsEnabled: boolean
	theme: Theme
	sidebarCollapsed: boolean
	errorNotificationsEnabled: boolean
}

export interface AuthState {
	user: User | null
	token: string | null
	isAuthenticated: boolean
	isLoading: boolean
}

export interface JobsState {
	jobs: Job[]
	filters: JobFilters
	isLoading: boolean
	error: string | null
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export interface RootState {
	app: AppState
	auth: AuthState
	jobs: JobsState
}

export interface ApiErrorResponse {
	message: string
	status: number
	code?: string
	details?: Record<string, any>
}

export interface ValidationError {
	field: string
	message: string
}

export interface ApiValidationError extends ApiErrorResponse {
	validationErrors: ValidationError[]
}
