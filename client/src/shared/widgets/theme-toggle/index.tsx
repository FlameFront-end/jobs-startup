import { Button } from '@/shared/kit'
import { useTheme } from '@/shared/lib/hooks/useTheme'

export function ThemeToggle() {
	const { toggleTheme, isDark } = useTheme()

	return <Button onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</Button>
}
