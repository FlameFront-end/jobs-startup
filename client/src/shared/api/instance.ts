import axios, { type AxiosError, type AxiosResponse } from 'axios'

import { env } from '@/shared/config/env'
import { tokenStorage } from '@/shared/lib/auth/token-storage'
import { ErrorHandlerStatic } from '@/shared/lib/error-handler'
import { logger } from '@/shared/lib/logger'
import { store } from '@/shared/lib/store'
import { toastService } from '@/shared/lib/toast'
import type { ApiResponse } from '@/shared/types/api'
import type { ApiErrorResponse } from '@/shared/types/global'

export const api = axios.create({
	baseURL: env.API_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json'
	}
})

api.interceptors.request.use(
	config => {
		logger.info('API Request', {
			method: config.method?.toUpperCase(),
			url: config.url,
			baseURL: config.baseURL
		})

		if (typeof window !== 'undefined') {
			const token = tokenStorage.get()
			if (token) {
				config.headers.Authorization = `Bearer ${token}`
			}
		}
		return config
	},
	error => {
		logger.error('API Request Error', {
			error: error.message,
			stack: error.stack
		})
		return Promise.reject(error)
	}
)

api.interceptors.response.use(
	(response: AxiosResponse<ApiResponse>) => {
		logger.info('API Response Success', {
			method: response.config.method?.toUpperCase(),
			url: response.config.url,
			status: response.status,
			statusText: response.statusText
		})
		return response
	},
	(error: AxiosError<ApiErrorResponse>) => {
		logger.error('API Response Error', {
			method: error.config?.method?.toUpperCase(),
			url: error.config?.url,
			status: error.response?.status,
			statusText: error.response?.statusText,
			message: error.message,
			data: error.response?.data,
			stack: error.stack
		})

		const apiError = ErrorHandlerStatic.handleApiError(error)

		if (ErrorHandlerStatic.isAuthError(error)) {
			logger.warn('Authentication Error - Redirecting to login', {
				status: error.response?.status,
				url: error.config?.url
			})
			if (typeof window !== 'undefined') {
				tokenStorage.remove()
				window.location.href = '/login'
			}
		}

		if (typeof window !== 'undefined') {
			const state = store.getState()
			if (state.app.errorNotificationsEnabled) {
				const errorMessage = error.response?.data?.message || error.message || 'Произошла ошибка сервера'
				const status = error.response?.status

				let title = 'Ошибка сервера'
				if (status) {
					if (status >= 500) {
						title = 'Ошибка сервера'
					} else if (status === 404) {
						title = 'Не найдено'
					} else if (status === 403) {
						title = 'Доступ запрещён'
					} else if (status === 401) {
						title = 'Не авторизован'
					} else if (status >= 400) {
						title = 'Ошибка запроса'
					}
				}

				toastService.error(errorMessage, title)
			}
		}

		return Promise.reject(apiError)
	}
)

export const testErrorLogging = () => {
	logger.info('Testing error logging...')

	api.get('/test-404-endpoint').catch(error => {
		logger.info('Test error caught:', error.message)
	})

	api.get('/test-500-endpoint').catch(error => {
		logger.info('Test server error caught:', error.message)
	})

	api.get('https://httpstat.us/404').catch(error => {
		logger.info('Test external 404 caught:', error.message)
	})
}
