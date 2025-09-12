import { Box, Button, Flex, For, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

import { testErrorLogging } from '@/shared/api/instance'
import { useTheme } from '@/shared/lib/hooks/useTheme'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { toggleErrorNotifications } from '@/shared/lib/store/slices/appSlice'
import { toaster } from '@/shared/lib/toast'
import { ROUTES } from '@/shared/model/routes'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

const HomePage = () => {
	const { theme, isDark } = useTheme()
	const dispatch = useAppDispatch()
	const errorNotificationsEnabled = useAppSelector(state => state.app.errorNotificationsEnabled)

	const testReactError = () => {
		throw new Error('Тестовая React ошибка для логирования')
	}

	const testPromiseRejection = () => {
		Promise.reject(new Error('Тестовая ошибка необработанного промиса'))
	}

	const handleToggleErrorNotifications = () => {
		dispatch(toggleErrorNotifications())
	}

	return (
		<PageWrapper className='home-page'>
			<Box p={8} maxW='1200px' mx='auto' mt={8}>
				<VStack align='start' gap={4} mb={8}>
					<Flex justify='space-between' align='center' width='100%' wrap='wrap' gap={4}>
						<VStack align='start' gap={2}>
							<Heading size='xl' color='var(--text-color)'>
								Главная страница
							</Heading>
							<Text color='var(--text-light)'>
								Текущая тема:{' '}
								<Text as='span' fontWeight='bold'>
									{isDark ? 'Тёмная' : 'Светлая'}
								</Text>{' '}
								({theme})
							</Text>
						</VStack>
						<ThemeToggle />
					</Flex>

					<Box width='100%'>
						<Flex justify='space-between' align='center' wrap='wrap' gap={3}>
							<Text color='var(--text-light)'>
								Уведомления об ошибках:{' '}
								<Text
									as='span'
									fontWeight='bold'
									color={errorNotificationsEnabled ? 'green.500' : 'red.500'}
								>
									{errorNotificationsEnabled ? 'Включены' : 'Выключены'}
								</Text>
							</Text>
							<Button
								size='sm'
								variant={errorNotificationsEnabled ? 'solid' : 'outline'}
								colorScheme={errorNotificationsEnabled ? 'green' : 'red'}
								onClick={handleToggleErrorNotifications}
								minW='fit-content'
							>
								{errorNotificationsEnabled ? 'Выключить' : 'Включить'}
							</Button>
						</Flex>
					</Box>
				</VStack>

				<VStack gap={8} align='stretch'>
					<Box>
						<Heading size='md' mb={4} color='var(--text-color)'>
							Тест toaster:
						</Heading>
						<HStack gap={2} wrap='wrap'>
							<For each={['success', 'error', 'warning', 'info']}>
								{type => (
									<Button
										size='sm'
										variant='outline'
										key={type}
										onClick={() =>
											toaster.create({
												title: `Toast status is ${type}`,
												type: type
											})
										}
									>
										{type}
									</Button>
								)}
							</For>
						</HStack>
					</Box>

					<Box>
						<Heading size='md' mb={4} color='var(--text-color)'>
							Тест логирования ошибок:
						</Heading>
						<HStack gap={2} wrap='wrap' mb={4}>
							<Button size='sm' variant='outline' colorScheme='red' onClick={testErrorLogging}>
								Тест API ошибок
							</Button>
							<Button size='sm' variant='outline' colorScheme='orange' onClick={testReactError}>
								Тест React ошибки
							</Button>
							<Button size='sm' variant='outline' colorScheme='purple' onClick={testPromiseRejection}>
								Тест Promise rejection
							</Button>
						</HStack>
					</Box>

					<Box>
						<Heading size='md' mb={4} color='var(--text-color)'>
							Навигация:
						</Heading>
						<HStack gap={3} wrap='wrap'>
							<Link to={ROUTES.LOGIN} className='nav-link'>
								Вход
							</Link>
							<Link to={ROUTES.REGISTER} className='nav-link'>
								Регистрация
							</Link>
							<Link to={ROUTES.SETTINGS} className='nav-link'>
								Настройки
							</Link>
							<Link to={ROUTES.JOBS} className='nav-link'>
								Вакансии
							</Link>
						</HStack>
					</Box>
				</VStack>
			</Box>
		</PageWrapper>
	)
}

export const Component = HomePage
