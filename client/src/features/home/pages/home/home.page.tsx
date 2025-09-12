import styles from './home.module.scss'

import { useState } from 'react'

import clsx from 'clsx'
import { Link } from 'react-router-dom'

import { testErrorLogging } from '@/shared/api/instance'
import { PageLoader } from '@/shared/kit'
import { useTheme } from '@/shared/lib/hooks/useTheme'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { toggleErrorNotifications } from '@/shared/lib/store/slices/appSlice'
import { useToast } from '@/shared/lib/toast'
import { ROUTES } from '@/shared/model/routes'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

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
		return <PageLoader message='Тестируем loader...' />
	}

	return (
		<PageWrapper className={styles.homePage}>
			<div className={styles.header}>
				<div className={styles.titleSection}>
					<h1 className={styles.title}>Главная страница</h1>
					<p className={styles.subtitle}>
						Текущая тема: <span className={styles.bold}>{isDark ? 'Тёмная' : 'Светлая'}</span> ({theme})
					</p>
				</div>
				<ThemeToggle />
			</div>

			<div className={styles.settings}>
				<p className={styles.settingText}>
					Уведомления об ошибках:{' '}
					<span className={clsx(styles.bold, styles[errorNotificationsEnabled ? 'enabled' : 'disabled'])}>
						{errorNotificationsEnabled ? 'Включены' : 'Выключены'}
					</span>
				</p>
				<button
					className={clsx(styles.button, styles[errorNotificationsEnabled ? 'enabled' : 'disabled'])}
					onClick={handleToggleErrorNotifications}
				>
					{errorNotificationsEnabled ? 'Выключить' : 'Включить'}
				</button>
			</div>

			<div className={styles.sections}>
				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>Тест toast уведомлений:</h2>
					<div className={styles.buttonGroup}>
						{(['success', 'error', 'warning', 'info', 'loading'] as const).map(type => (
							<button
								key={type}
								className={clsx(styles.button, styles[type])}
								onClick={() => testToast(type)}
							>
								{type}
							</button>
						))}
					</div>
				</div>

				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>Тест loader:</h2>
					<div className={styles.buttonGroup}>
						<button className={clsx(styles.button, styles.info)} onClick={testLoader}>
							Показать PageLoader
						</button>
					</div>
				</div>

				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>Тест логирования ошибок:</h2>
					<div className={styles.buttonGroup}>
						<button className={clsx(styles.button, styles.error)} onClick={testErrorLogging}>
							Тест API ошибок
						</button>
						<button className={clsx(styles.button, styles.warning)} onClick={testReactError}>
							Тест React ошибки
						</button>
						<button className={clsx(styles.button, styles.info)} onClick={testPromiseRejection}>
							Тест Promise rejection
						</button>
					</div>
				</div>

				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>Навигация:</h2>
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
					</div>
				</div>
			</div>
		</PageWrapper>
	)
}

export const Component = HomePage
