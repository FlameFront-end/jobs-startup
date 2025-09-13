import { RouterProvider } from 'react-router-dom'

import { useGlobalErrorHandlers } from '@/shared/lib/hooks/useGlobalErrorHandlers'
import { useThemeInitialization } from '@/shared/lib/hooks/useThemeInitialization'

import { Providers } from './model/providers'
import { router } from './model/router'

export const App = () => {
	useThemeInitialization()
	useGlobalErrorHandlers()

	return (
		<Providers>
			<RouterProvider router={router} />
		</Providers>
	)
}
