import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'

import { idGenerator } from '@/shared/lib/utils/id-generator'
import type { ToastProps } from '@/shared/widgets/toast'
import { ToastContainer } from '@/shared/widgets/toast/toast-container'

import { setToastInstance } from './toast-service'

interface ToastContextType {
	success: (message: string, title?: string) => void
	error: (message: string, title?: string) => void
	warning: (message: string, title?: string) => void
	info: (message: string, title?: string) => void
	loading: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
	children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
	const [toasts, setToasts] = useState<ToastProps[]>([])

	const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
		const id = idGenerator.generateShort('toast')
		const newToast: ToastProps = {
			...toast,
			id,
			onClose: (id: string) => {
				setToasts(prev => prev.filter(toast => toast.id !== id))
			}
		}
		setToasts(prev => [...prev, newToast])
	}, [])

	const success = useCallback(
		(message: string, title = 'Успех') => {
			addToast({
				title,
				description: message,
				type: 'success',
				closable: true,
				duration: 5000
			})
		},
		[addToast]
	)

	const error = useCallback(
		(message: string, title = 'Ошибка') => {
			addToast({
				title,
				description: message,
				type: 'error',
				closable: true,
				duration: 7000
			})
		},
		[addToast]
	)

	const warning = useCallback(
		(message: string, title = 'Предупреждение') => {
			addToast({
				title,
				description: message,
				type: 'warning',
				closable: true,
				duration: 6000
			})
		},
		[addToast]
	)

	const info = useCallback(
		(message: string, title = 'Информация') => {
			addToast({
				title,
				description: message,
				type: 'info',
				closable: true,
				duration: 5000
			})
		},
		[addToast]
	)

	const loading = useCallback(
		(message: string, title = 'Загрузка') => {
			addToast({
				title,
				description: message,
				type: 'loading',
				closable: true,
				duration: 0
			})
		},
		[addToast]
	)

	useEffect(() => {
		setToastInstance({
			success,
			error,
			warning,
			info,
			loading
		})
	}, [success, error, warning, info, loading])

	const handleClose = useCallback((id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id))
	}, [])

	return (
		<ToastContext.Provider value={{ success, error, warning, info, loading }}>
			{children}
			<ToastContainer toasts={toasts} onClose={handleClose} />
		</ToastContext.Provider>
	)
}

export function useToast() {
	const context = useContext(ToastContext)

	if (context === undefined) {
		throw new Error('useToast must be used within a ToastProvider')
	}
	return context
}
