import { type ReactNode } from 'react'

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'

import { queryClient } from '@/shared/api/query-client'
import { store } from '@/shared/lib/store'
import { ToastProvider } from '@/shared/lib/toast'

const system = createSystem(defaultConfig)

function ThemeInitializer() {
	return null
}

interface ProvidersProps {
	children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
	return (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<ChakraProvider value={system}>
					<ThemeInitializer />
					<ToastProvider>{children}</ToastProvider>
				</ChakraProvider>
			</QueryClientProvider>
		</Provider>
	)
}
