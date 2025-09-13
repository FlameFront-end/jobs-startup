export interface ApiResponse<T = unknown> {
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

export interface ApiErrorResponse {
	message: string
	status: number
	code?: string
	details?: Record<string, unknown>
}

export interface ValidationError {
	field: string
	message: string
}

export interface ApiValidationError extends ApiErrorResponse {
	validationErrors: ValidationError[]
}
