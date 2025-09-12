import { type ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'

import { queryClient } from '@/shared/api/query-client'
import { store } from '@/shared/lib/store'
import { ToastProvider } from '@/shared/lib/toast'

import { ErrorBoundaryProvider } from './error-boundary'

interface ProvidersProps {
	children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
	return (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<ToastProvider>
					<ErrorBoundaryProvider>{children}</ErrorBoundaryProvider>
				</ToastProvider>
			</QueryClientProvider>
		</Provider>
	)
}
