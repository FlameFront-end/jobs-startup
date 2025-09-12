import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AppState {
	animationsEnabled: boolean
	theme: 'light' | 'dark'
	sidebarCollapsed: boolean
}

const initialState: AppState = {
	animationsEnabled: false,
	theme: 'light',
	sidebarCollapsed: false
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
		setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
			state.theme = action.payload
		},
		toggleSidebar: state => {
			state.sidebarCollapsed = !state.sidebarCollapsed
		},
		setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
			state.sidebarCollapsed = action.payload
		}
	}
})

export const { toggleAnimations, setAnimationsEnabled, setTheme, toggleSidebar, setSidebarCollapsed } = appSlice.actions

export default appSlice.reducer
