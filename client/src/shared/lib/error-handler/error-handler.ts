import { AxiosError } from 'axios'

import { logger } from '@/shared/lib/logger'
import type { ApiErrorResponse, ApiValidationError } from '@/shared/types/api'

export class ErrorHandler {
	handleApiError(error: AxiosError): ApiErrorResponse {
		const response = error.response?.data as ApiErrorResponse | undefined

		logger.error('API Error Handler', {
			status: error.response?.status,
			statusText: error.response?.statusText,
			url: error.config?.url,
			method: error.config?.method,
			message: error.message,
			code: error.code,
			responseData: response
		})

		if (response) {
			return {
				message: response.message || 'Произошла ошибка сервера',
				status: error.response?.status || 500,
				code: response.code,
				details: response.details
			}
		}

		if (error.code === 'NETWORK_ERROR' || !error.response) {
			return {
				message: 'Ошибка сети. Проверьте подключение к интернету',
				status: 0,
				code: 'NETWORK_ERROR'
			}
		}

		return {
			message: 'Произошла неизвестная ошибка',
			status: error.response?.status || 500,
			code: 'UNKNOWN_ERROR'
		}
	}

	handleValidationError(error: AxiosError): ApiValidationError | null {
		const response = error.response?.data as ApiValidationError | undefined

		if (response?.validationErrors) {
			return response
		}

		return null
	}

	isNetworkError(error: AxiosError): boolean {
		return !error.response || error.code === 'NETWORK_ERROR'
	}

	isAuthError(error: AxiosError): boolean {
		return error.response?.status === 401
	}

	isServerError(error: AxiosError): boolean {
		const status = error.response?.status
		return status ? status >= 500 : false
	}

	isClientError(error: AxiosError): boolean {
		const status = error.response?.status
		return status ? status >= 400 && status < 500 : false
	}
}

export const errorHandler = new ErrorHandler()

export const ErrorHandlerStatic = {
	handleApiError: (error: AxiosError) => errorHandler.handleApiError(error),
	handleValidationError: (error: AxiosError) => errorHandler.handleValidationError(error),
	isNetworkError: (error: AxiosError) => errorHandler.isNetworkError(error),
	isAuthError: (error: AxiosError) => errorHandler.isAuthError(error),
	isServerError: (error: AxiosError) => errorHandler.isServerError(error),
	isClientError: (error: AxiosError) => errorHandler.isClientError(error)
}
