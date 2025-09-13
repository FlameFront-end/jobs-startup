import { type ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'

import { queryClient } from '@/shared/api/query-client'
import { AnalyticsProvider } from '@/shared/lib/analytics/analytics-provider'
import { store } from '@/shared/lib/store'
import { ToastProvider } from '@/shared/lib/toast'

interface ProvidersProps {
	children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
	return (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<AnalyticsProvider>
					<ToastProvider>{children}</ToastProvider>
				</AnalyticsProvider>
			</QueryClientProvider>
		</Provider>
	)
}
