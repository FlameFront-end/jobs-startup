import { useTheme } from '@/shared/lib/hooks/useTheme'

import styles from './theme-toggle.module.scss'

export function ThemeToggle() {
	const { toggleTheme, isDark } = useTheme()

	return (
		<button className={styles.button} onClick={toggleTheme}>
			{isDark ? '☀️' : '🌙'}
		</button>
	)
}
