import '@/shared/styles/main.scss'

import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { logger } from '@/shared/lib/logger'
import { Providers } from './model/providers'
import { router } from './model/router'

document.documentElement.setAttribute('data-theme', 'dark')

window.addEventListener('error', event => {
	logger.error('Global Error', {
		message: event.message,
		filename: event.filename,
		lineno: event.lineno,
		colno: event.colno,
		error: event.error
	})
})

window.addEventListener('unhandledrejection', event => {
	logger.error('Unhandled Promise Rejection', {
		reason: event.reason,
		promise: event.promise
	})
})

createRoot(document.getElementById('root')!).render(
	<Providers>
		<RouterProvider router={router} />
	</Providers>
)
