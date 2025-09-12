import { queryClient } from '@/shared/api/query-client'
import { store } from '@/shared/lib/store'
import { ToastProvider } from '@/shared/lib/toast'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'

const system = createSystem(defaultConfig)

interface ProvidersProps {
	children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
	return (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<ChakraProvider value={system}>
					<ToastProvider>{children}</ToastProvider>
				</ChakraProvider>
			</QueryClientProvider>
		</Provider>
	)
}
