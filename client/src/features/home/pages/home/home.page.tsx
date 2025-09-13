import styles from './home.module.scss'

import { useState } from 'react'

import clsx from 'clsx'
import { Link } from 'react-router-dom'

import { testErrorLogging } from '@/shared/api/instance'
import { Button, Card, FullScreenLoader } from '@/shared/kit'
import { useTheme } from '@/shared/lib/hooks/useTheme'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { toggleErrorNotifications } from '@/shared/lib/store/slices/appSlice'
import { useToast } from '@/shared/lib/toast'
import { ROUTES } from '@/shared/model/routes'
import { PageWrapper } from '@/shared/widgets/page-wrapper'
import { ThemeToggle } from '@/shared/widgets/theme-toggle'

const HomePage = () => {
	const { theme, isDark } = useTheme()
	const dispatch = useAppDispatch()
	const errorNotificationsEnabled = useAppSelector(state => state.app.errorNotificationsEnabled)
	const toast = useToast()
	const [showLoader, setShowLoader] = useState(false)

	const testReactError = () => {
		throw new Error('Тестовая React ошибка для логирования')
	}

	const testPromiseRejection = () => {
		Promise.reject(new Error('Тестовая ошибка необработанного промиса'))
	}

	const handleToggleErrorNotifications = () => {
		dispatch(toggleErrorNotifications())
	}

	const testToast = (type: 'success' | 'error' | 'warning' | 'info' | 'loading') => {
		const messages = {
			success: 'Операция выполнена успешно!',
			error: 'Произошла ошибка при выполнении операции',
			warning: 'Внимание! Проверьте введенные данные',
			info: 'Полезная информация для пользователя',
			loading: 'Выполняется загрузка данных...'
		}

		const titles = {
			success: 'Успех',
			error: 'Ошибка',
			warning: 'Предупреждение',
			info: 'Информация',
			loading: 'Загрузка'
		}

		toast[type](messages[type], titles[type])
	}

	const testLoader = () => {
		setShowLoader(true)
		setTimeout(() => setShowLoader(false), 2000)
	}

	if (showLoader) {
		return <FullScreenLoader message='Тестируем loader...' />
	}

	return (
		<PageWrapper className={styles.wrapper}>
			<Card contentClassName={styles.header} variant='plain'>
				<div className={styles.titleSection}>
					<h1 className={styles.title}>Главная страница</h1>
					<p className={styles.subtitle}>
						Текущая тема: <span className={styles.bold}>{isDark ? 'Тёмная' : 'Светлая'}</span> ({theme})
					</p>
				</div>
				<ThemeToggle />
			</Card>

			<Card contentClassName={styles.settings}>
				<div className={styles.settingText}>
					Уведомления об ошибках:{' '}
					<span className={clsx(styles.bold, styles[errorNotificationsEnabled ? 'enabled' : 'disabled'])}>
						{errorNotificationsEnabled ? 'Включены' : 'Выключены'}
					</span>
				</div>
				<Button
					variant={errorNotificationsEnabled ? 'enabled' : 'disabled'}
					onClick={handleToggleErrorNotifications}
				>
					{errorNotificationsEnabled ? 'Выключить' : 'Включить'}
				</Button>
			</Card>

			<Card title='Навигация:'>
				<div className={styles.navLinks}>
					<Link to={ROUTES.LOGIN} className={styles.navLink}>
						Вход
					</Link>
					<Link to={ROUTES.REGISTER} className={styles.navLink}>
						Регистрация
					</Link>
					<Link to={ROUTES.SETTINGS} className={styles.navLink}>
						Настройки
					</Link>
					<Link to={ROUTES.JOBS} className={styles.navLink}>
						Вакансии
					</Link>
					<Link to={ROUTES.TEST_ERROR} className={styles.navLink}>
						Тест ошибки
					</Link>
					<Link to={ROUTES.SELECTION_DEMO} className={styles.navLink}>
						Демо выделения
					</Link>
					<Link to={ROUTES.POSTS} className={styles.navLink}>
						Посты (Infinite Scroll)
					</Link>
				</div>
			</Card>

			<Card title='Тест toast уведомлений:'>
				<div className={styles.buttonGroup}>
					{(['success', 'error', 'warning', 'info', 'loading'] as const).map(type => (
						<Button key={type} variant={type} onClick={() => testToast(type)}>
							{type}
						</Button>
					))}
				</div>
			</Card>

			<Card title='Тест loader:'>
				<div className={styles.buttonGroup}>
					<Button variant='info' onClick={testLoader}>
						Показать FullScreenLoader
					</Button>
				</div>
			</Card>

			<Card title='Тест логирования ошибок:'>
				<div className={styles.buttonGroup}>
					<Button variant='error' onClick={testErrorLogging}>
						Тест API ошибок
					</Button>
					<Button variant='warning' onClick={testReactError}>
						Тест React ошибки
					</Button>
					<Button variant='info' onClick={testPromiseRejection}>
						Тест Promise rejection
					</Button>
				</div>
			</Card>

			<Card title='Примеры кнопок'>
				<div className={styles.buttonExamples}>
					<Button variant='default'>Стандартная</Button>
					<Button variant='success'>Успех</Button>
					<Button variant='error'>Ошибка</Button>
					<Button variant='warning'>Предупреждение</Button>
					<Button variant='info'>Информация</Button>
					<Button variant='loading'>Загрузка</Button>
					<Button variant='enabled'>Включено</Button>
					<Button variant='disabled'>Отключено</Button>
				</div>

				<div className={styles.buttonExamples}>
					<Button size='sm'>Маленькая</Button>
					<Button size='md'>Средняя</Button>
					<Button size='lg'>Большая</Button>
				</div>

				<div className={styles.buttonExamples}>
					<Button variant='text'>Текстовая кнопка</Button>
					<Button variant='link' href='/login'>
						Ссылка-кнопка
					</Button>
					<Button variant='link' href='/register'>
						Регистрация
					</Button>
				</div>

				<div className={styles.buttonExamples}>
					<Button width='fit'>Подходящая</Button>
					<Button width='half'>Половина</Button>
					<Button width='full' variant='info'>
						Полная ширина
					</Button>
				</div>
			</Card>

			<Card title='Примеры карточек'>
				<div className={styles.cardExamples}>
					<Card title='Стандартная' variant='default' size='sm' width='half'>
						<p>Обычная карточка с фоном и границей</p>
					</Card>

					<Card title='Только граница' variant='outlined' size='sm' width='half'>
						<p>Карточка с фоном и толстой границей</p>
					</Card>

					<Card title='Заливка' variant='filled' size='sm' width='half' background='light'>
						<p>Карточка с контрастным фоном</p>
					</Card>

					<Card title='С тенью' variant='elevated' size='sm' width='half'>
						<p>Карточка с заметной тенью</p>
					</Card>

					<Card
						title='Кликабельная'
						variant='default'
						size='sm'
						width='half'
						onClick={() => toast.success('Карточка нажата!', 'Успех')}
					>
						<p>Нажми на меня!</p>
					</Card>

					<Card title='Отключенная' variant='default' size='sm' width='half' disabled>
						<p>Эта карточка отключена</p>
					</Card>

					<Card title='Подходящая по размеру' variant='elevated' size='sm' width='fit'>
						<p>fit-content</p>
					</Card>

					<Card title='Треть ширины' variant='outlined' size='sm' width='third'>
						<p>33.333% ширины</p>
					</Card>

					<Card title='Четверть ширины' variant='outlined' size='sm' width='quarter'>
						<p>25% ширины</p>
					</Card>

					<Card title='Цветной фон' variant='filled' size='sm' width='half' background='primary'>
						<p>Карточка с цветным фоном</p>
					</Card>

					<Card title='Успех' variant='filled' size='sm' width='half' background='success'>
						<p>Зеленый фон</p>
					</Card>

					<Card title='Предупреждение' variant='filled' size='sm' width='half' background='warning'>
						<p>Желтый фон</p>
					</Card>

					<Card title='Ошибка' variant='filled' size='sm' width='half' background='error'>
						<p>Красный фон</p>
					</Card>

					<Card title='Полная ширина' variant='outlined' size='md' width='full'>
						<p>Эта карточка растягивается на всю доступную ширину контейнера</p>
						<div className={styles.buttonGroup}>
							<Button variant='info'>Кнопка 1</Button>
							<Button variant='warning'>Кнопка 2</Button>
							<Button variant='success'>Кнопка 3</Button>
						</div>
					</Card>

					<Card title='Большая карточка' variant='elevated' size='lg' width='full'>
						<p>Карточка с большими отступами и радиусом</p>
						<div className={styles.buttonGroup}>
							<Button variant='info'>Кнопка 1</Button>
							<Button variant='success'>Кнопка 2</Button>
						</div>
					</Card>
				</div>
			</Card>

			<Card title='Тест аналитики:'>
				<div className={styles.buttonGroup}>
					<Button variant='success' analyticsCategory='analytics_test' analyticsLabel='analytics_test_button'>
						Тест аналитики (проверь Network)
					</Button>
				</div>
			</Card>
		</PageWrapper>
	)
}

export const Component = HomePage
