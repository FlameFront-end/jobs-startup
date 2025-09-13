import { useEffect } from 'react'

import { themeUtils } from '@/shared/lib/theme/theme-utils'

export const useThemeInitialization = () => {
	useEffect(() => {
		document.documentElement.setAttribute('data-theme', themeUtils.getInitialTheme())
	}, [])
}
