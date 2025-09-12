import { useEffect, useState } from 'react'

import { RouterProvider } from 'react-router-dom'

import { PageLoader } from '@/shared/kit'
import { logger } from '@/shared/lib/logger'

import { Providers } from './model/providers'
import { router } from './model/router'

const getInitialTheme = (): string => {
	const savedTheme = localStorage.getItem('app-theme')
	return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
}

export const App = () => {
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', getInitialTheme())

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

		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 1000)

		return () => {
			clearTimeout(timer)
			window.removeEventListener('error', handleError)
			window.removeEventListener('unhandledrejection', handleUnhandledRejection)
		}
	}, [])

	if (isLoading) {
		return <PageLoader />
	}

	return (
		<Providers>
			<RouterProvider router={router} />
		</Providers>
	)
}
