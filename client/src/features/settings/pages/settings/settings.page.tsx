import styles from './settings.module.scss'

import clsx from 'clsx'
import { Link } from 'react-router-dom'

import { useToast } from '@/shared/lib/toast'
import { ROUTES } from '@/shared/model/routes'
import { PageWrapper } from '@/shared/widgets/page-wrapper'

const SettingsPage = () => {
	const toast = useToast()

	const handleEmailToggle = () => {
		toast.success('Email уведомления включены')
	}

	const handlePushToggle = () => {
		toast.info('Push уведомления настроены')
	}

	const handlePasswordChange = () => {
		toast.warning('Функция смены пароля в разработке')
	}

	const handleTestToasts = () => {
		toast.success('Успешное уведомление!')
		setTimeout(() => toast.error('Ошибка!'), 1000)
		setTimeout(() => toast.warning('Предупреждение!'), 2000)
		setTimeout(() => toast.info('Информация!'), 3000)
	}

	return (
		<PageWrapper className={styles.settingsPage}>
			<div className={styles.container}>
				<h1>Настройки</h1>

				<div className={styles.section}>
					<h2>Уведомления</h2>
					<div className={styles.checkboxGroup}>
						<label className={styles.checkboxLabel}>
							<input type='checkbox' defaultChecked onChange={handleEmailToggle} />
							<span>Email уведомления</span>
						</label>
						<label className={styles.checkboxLabel}>
							<input type='checkbox' defaultChecked onChange={handlePushToggle} />
							<span>Push уведомления</span>
						</label>
					</div>
				</div>

				<div className={styles.section}>
					<h2>Безопасность</h2>
					<button onClick={handlePasswordChange} className={clsx(styles.button, styles.buttonDanger)}>
						Сменить пароль
					</button>
				</div>

				<div className={styles.section}>
					<h2>Тест уведомлений</h2>
					<button onClick={handleTestToasts} className={clsx(styles.button, styles.buttonPrimary)}>
						Показать все типы уведомлений
					</button>
				</div>

				<Link to={ROUTES.HOME} className={styles.backLink}>
					← Назад на главную
				</Link>
			</div>
		</PageWrapper>
	)
}

export const Component = SettingsPage
