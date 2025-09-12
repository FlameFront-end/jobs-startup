import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import type { Theme } from '@/shared/types/global'
import type { RootState } from '../store'
import { setTheme, toggleTheme } from '../store/slices/appSlice'

export const useTheme = () => {
	const theme = useSelector((state: RootState) => state.app.theme)
	const dispatch = useDispatch()

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme)
	}, [theme])

	const toggle = () => {
		dispatch(toggleTheme())
	}

	const set = (newTheme: Theme) => {
		dispatch(setTheme(newTheme))
	}

	return {
		theme,
		toggle,
		toggleTheme: toggle,
		set,
		isDark: theme === 'dark',
		isLight: theme === 'light'
	}
}
