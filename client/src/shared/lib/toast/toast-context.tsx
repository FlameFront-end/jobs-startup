import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'

import type { ToastProps } from '@/shared/ui/toast'
import { ToastContainer } from '@/shared/ui/toast/toast-container'

import { setToastInstance } from './global-toast'

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

	useEffect(() => {
		setToastInstance({
			success,
			error,
			warning,
			info,
			loading
		})
	}, [])

	const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
		const id = Math.random().toString(36).substr(2, 9)
		const newToast: ToastProps = {
			...toast,
			id,
			onClose: (id: string) => {
				setToasts(prev => prev.filter(toast => toast.id !== id))
			}
		}
		setToasts(prev => [...prev, newToast])
	}, [])

	const success = (message: string, title = 'Успех') => {
		addToast({
			title,
			description: message,
			type: 'success',
			closable: true,
			duration: 5000
		})
	}

	const error = (message: string, title = 'Ошибка') => {
		addToast({
			title,
			description: message,
			type: 'error',
			closable: true,
			duration: 7000
		})
	}

	const warning = (message: string, title = 'Предупреждение') => {
		addToast({
			title,
			description: message,
			type: 'warning',
			closable: true,
			duration: 6000
		})
	}

	const info = (message: string, title = 'Информация') => {
		addToast({
			title,
			description: message,
			type: 'info',
			closable: true,
			duration: 5000
		})
	}

	const loading = (message: string, title = 'Загрузка') => {
		addToast({
			title,
			description: message,
			type: 'loading',
			closable: true,
			duration: 0
		})
	}

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
