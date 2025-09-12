import '@/shared/styles/main.scss'

import { createRoot } from 'react-dom/client'

import { logger } from '@/shared/lib/logger'

import { App } from './app'

const getInitialTheme = (): string => {
	const savedTheme = localStorage.getItem('app-theme')
	return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
}

document.documentElement.setAttribute('data-theme', getInitialTheme())

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
