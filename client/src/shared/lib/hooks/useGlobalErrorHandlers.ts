import { useEffect } from 'react'

import { logger } from '@/shared/lib/logger'

export const useGlobalErrorHandlers = () => {
	useEffect(() => {
		const handleError = (event: ErrorEvent) => {
			logger.error('Global Error', {
				message: event.message,
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
				error: event.error
			})
		}

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			logger.error('Unhandled Promise Rejection', {
				reason: event.reason,
				promise: event.promise
			})
		}

		window.addEventListener('error', handleError)
		window.addEventListener('unhandledrejection', handleUnhandledRejection)

		return () => {
			window.removeEventListener('error', handleError)
			window.removeEventListener('unhandledrejection', handleUnhandledRejection)
		}
	}, [])
}
