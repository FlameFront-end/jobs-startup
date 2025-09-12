import { createContext, type ReactNode, useContext } from 'react'

import { useTheme } from '@/shared/lib/hooks/useTheme'
import { Toaster as ChakraToaster, createToaster, Portal, Spinner, Stack, Toast } from '@chakra-ui/react'

export const toaster = createToaster({
	placement: 'top',
	pauseOnPageIdle: true,
	duration: 5000
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
	const { isDark } = useTheme()

	const success = (message: string, title = 'Успех') => {
		toaster.create({
			title,
			description: message,
			type: 'success',
			closable: true
		})
	}

	const error = (message: string, title = 'Ошибка') => {
		toaster.create({
			title,
			description: message,
			type: 'error',
			closable: true
		})
	}

	const warning = (message: string, title = 'Предупреждение') => {
		toaster.create({
			title,
			description: message,
			type: 'warning',
			closable: true
		})
	}

	const info = (message: string, title = 'Информация') => {
		toaster.create({
			title,
			description: message,
			type: 'info',
			closable: true
		})
	}

	return (
		<ToastContext.Provider value={{ success, error, warning, info }}>
			{children}
			<Portal>
				<ChakraToaster toaster={toaster} insetInline='4'>
					{toast => (
						<Toast.Root
							width='420px'
							bg={isDark ? 'var(--background-card)' : 'white'}
							shadow='2xl'
							borderRadius='12px'
							border='1px solid'
							borderColor={isDark ? 'var(--border-color)' : 'transparent'}
							boxShadow={
								isDark
									? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
									: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
							}
							overflow='hidden'
							position='relative'
						>
							<Stack direction='row' align='flex-start' gap='0' width='100%' position='relative'>
								<Stack direction='row' align='center' gap='3' flex='1' p='4' position='relative'>
									{toast.type === 'loading' ? (
										<Spinner size='sm' color={isDark ? 'var(--primary-color)' : 'blue.500'} />
									) : (
										<Toast.Indicator
											width='4px'
											height='100%'
											position='absolute'
											left='0'
											top='0'
											bottom='0'
											bg={
												toast.type === 'success'
													? isDark
														? 'var(--success-color)'
														: 'green.500'
													: toast.type === 'error'
														? isDark
															? 'var(--error-color)'
															: 'red.500'
														: toast.type === 'warning'
															? isDark
																? 'var(--warning-color)'
																: 'orange.500'
															: isDark
																? 'var(--primary-color)'
																: 'blue.500'
											}
											borderRadius='0'
										/>
									)}

									<Stack gap='1' flex='1' maxWidth='100%'>
										{toast.title && (
											<Toast.Title
												fontSize='15px'
												fontWeight='600'
												color={isDark ? 'var(--text-color)' : 'gray.900'}
												lineHeight='1.3'
											>
												{toast.title}
											</Toast.Title>
										)}
										{toast.description && (
											<Toast.Description
												fontSize='14px'
												color={isDark ? 'var(--text-light)' : 'gray.600'}
												lineHeight='1.4'
												mt='1'
											>
												{toast.description}
											</Toast.Description>
										)}
									</Stack>
								</Stack>

								<Stack direction='row' align='center' gap='2' p='4' pt='4'>
									{toast.action && (
										<Toast.ActionTrigger
											bg='transparent'
											color={isDark ? 'var(--primary-color)' : 'blue.600'}
											_hover={{
												bg: isDark ? 'var(--background-light)' : 'blue.50'
											}}
											px='3'
											py='2'
											borderRadius='6px'
											fontSize='13px'
											fontWeight='500'
											border='1px solid'
											borderColor={isDark ? 'var(--border-color)' : 'blue.200'}
										>
											{toast.action.label}
										</Toast.ActionTrigger>
									)}
									{toast.closable && (
										<Toast.CloseTrigger
											color={isDark ? 'var(--text-light)' : 'gray.400'}
											_hover={{
												color: isDark ? 'var(--text-color)' : 'gray.600',
												bg: isDark ? 'var(--background-light)' : 'gray.100'
											}}
											p='2'
											borderRadius='6px'
											width='8'
											height='8'
											display='flex'
											alignItems='center'
											justifyContent='center'
										>
											×
										</Toast.CloseTrigger>
									)}
								</Stack>
							</Stack>
						</Toast.Root>
					)}
				</ChakraToaster>
			</Portal>
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
