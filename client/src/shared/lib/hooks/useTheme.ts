import { useCallback, useEffect, useMemo } from 'react'

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

	const toggle = useCallback(() => {
		dispatch(toggleTheme())
	}, [dispatch])

	const set = useCallback(
		(newTheme: Theme) => {
			dispatch(setTheme(newTheme))
		},
		[dispatch]
	)

	const isDark = useMemo(() => theme === 'dark', [theme])
	const isLight = useMemo(() => theme === 'light', [theme])

	return {
		theme,
		toggle,
		toggleTheme: toggle,
		set,
		isDark,
		isLight
	}
}
