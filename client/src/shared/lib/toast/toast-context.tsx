import { createToaster, Toaster } from '@chakra-ui/react'
import { createContext, type ReactNode, useContext } from 'react'

const toaster = createToaster({
	placement: 'top',
	duration: 4000
})

interface ToastContextType {
	success: (message: string, title?: string) => void
	error: (message: string, title?: string) => void
	warning: (message: string, title?: string) => void
	info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
	children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
	const success = (message: string, title = 'Успех') => {
		toaster.create({
			title,
			description: message,
			status: 'success',
			isClosable: true
		})
	}

	const error = (message: string, title = 'Ошибка') => {
		toaster.create({
			title,
			description: message,
			status: 'error',
			isClosable: true
		})
	}

	const warning = (message: string, title = 'Предупреждение') => {
		toaster.create({
			title,
			description: message,
			status: 'warning',
			isClosable: true
		})
	}

	const info = (message: string, title = 'Информация') => {
		toaster.create({
			title,
			description: message,
			status: 'info',
			isClosable: true
		})
	}

	return (
		<ToastContext.Provider value={{ success, error, warning, info }}>
			{children}
			<Toaster toaster={toaster} />
		</ToastContext.Provider>
	)

export function useToast() {
	const context = useContext(ToastContext)
	if (context === undefined) {
		throw new Error('useToast must be used within a ToastProvider')
	}
	return context
}
