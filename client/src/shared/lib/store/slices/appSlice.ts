import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AppState, Theme } from '@/shared/types/global'

const getInitialTheme = (): Theme => {
	const savedTheme = localStorage.getItem('app-theme')
	return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
}

const getInitialErrorNotifications = (): boolean => {
	const saved = localStorage.getItem('app-errorNotificationsEnabled')
	return saved ? JSON.parse(saved) : true
}

const initialState: AppState = {
	animationsEnabled: false,
	theme: getInitialTheme(),
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
