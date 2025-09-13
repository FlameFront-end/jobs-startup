import { storageUtils } from '@/shared/lib/storage'
import type { Theme } from '@/shared/types/global'

const THEME_STORAGE_KEY = 'app-theme'

export const themeUtils = {
	getInitialTheme: (): Theme => {
		const savedTheme = storageUtils.getString(THEME_STORAGE_KEY, 'dark')
		return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
	},

	setTheme: (theme: Theme): void => {
		storageUtils.setString(THEME_STORAGE_KEY, theme)
	},

	removeTheme: (): void => {
		storageUtils.remove(THEME_STORAGE_KEY)
	}
}
