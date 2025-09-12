import '@/shared/styles/main.scss'

import { createRoot } from 'react-dom/client'

import { logger } from '@/shared/lib/logger'

import { App } from './app'

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

createRoot(document.getElementById('root')!).render(<App />)
