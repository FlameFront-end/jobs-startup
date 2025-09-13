import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { themeUtils } from '@/shared/lib/theme/theme-utils'
import type { Theme } from '@/shared/types/global'

export interface AppState {
	animationsEnabled: boolean
	theme: Theme
	sidebarCollapsed: boolean
	errorNotificationsEnabled: boolean
}

const getInitialErrorNotifications = (): boolean => {
	const saved = typeof window !== 'undefined' ? localStorage.getItem('app-errorNotificationsEnabled') : null
	return saved ? JSON.parse(saved) : true
}

const initialState: AppState = {
	animationsEnabled: true,
	theme: themeUtils.getInitialTheme(),
	sidebarCollapsed: false,
	errorNotificationsEnabled: getInitialErrorNotifications()
}

export const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		toggleAnimations: state => {
			state.animationsEnabled = !state.animationsEnabled
		},
		setAnimationsEnabled: (state, action: PayloadAction<boolean>) => {
			state.animationsEnabled = action.payload
		},
		setTheme: (state, action: PayloadAction<Theme>) => {
			state.theme = action.payload
		},
		toggleTheme: state => {
			state.theme = state.theme === 'light' ? 'dark' : 'light'
		},
		toggleSidebar: state => {
			state.sidebarCollapsed = !state.sidebarCollapsed
		},
		setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
			state.sidebarCollapsed = action.payload
		},
		toggleErrorNotifications: state => {
			state.errorNotificationsEnabled = !state.errorNotificationsEnabled
		},
		setErrorNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
			state.errorNotificationsEnabled = action.payload
		}
	}
})

export const {
	toggleAnimations,
	setAnimationsEnabled,
	setTheme,
	toggleTheme,
	toggleSidebar,
	setSidebarCollapsed,
	toggleErrorNotifications,
	setErrorNotificationsEnabled
} = appSlice.actions

export default appSlice.reducer
