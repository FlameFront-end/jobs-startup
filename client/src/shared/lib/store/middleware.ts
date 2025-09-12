import type { Middleware } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'

import { env } from '@/shared/config/env'

import type { RootState } from './index'

const logger = createLogger({
	collapsed: true,
	diff: true
})

const persistMiddleware: Middleware = store => next => action => {
	const result = next(action)

	if (
		action &&
		typeof action === 'object' &&
		'type' in action &&
		typeof action.type === 'string' &&
		action.type.startsWith('app/')
	) {
		const state = store.getState() as RootState
		const appState = state.app

		localStorage.setItem('app-theme', appState.theme)
		localStorage.setItem('app-errorNotificationsEnabled', JSON.stringify(appState.errorNotificationsEnabled))
	}

	return result
}

export const middleware = env.IS_DEV ? [persistMiddleware, logger] : [persistMiddleware]
