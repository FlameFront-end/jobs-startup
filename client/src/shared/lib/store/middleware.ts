import type { Middleware } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'

import { themeUtils } from '@/shared/lib/theme/theme-utils'
import { env } from '@/shared/model/config'

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

		themeUtils.setTheme(appState.theme)
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(
					'app-errorNotificationsEnabled',
					JSON.stringify(appState.errorNotificationsEnabled)
				)
			} catch (error) {
				console.warn('Failed to save errorNotificationsEnabled to localStorage:', error)
			}
		}
	}

	return result
}

export const middleware = env.IS_DEV ? [persistMiddleware, logger] : [persistMiddleware]
