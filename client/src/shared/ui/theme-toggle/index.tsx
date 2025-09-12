import { Button } from '@chakra-ui/react'

import { useTheme } from '@/shared/lib/hooks/useTheme'

export function ThemeToggle() {
	const { toggleTheme, isDark } = useTheme()

	return (
		<Button onClick={toggleTheme} variant='outline' size='sm'>
			{isDark ? '☀️' : '🌙'}
		</Button>
	)
}
