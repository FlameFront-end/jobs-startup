import { useToast } from '@/shared/lib/toast'
import { ROUTES } from '@/shared/model/routes'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { Link } from 'react-router-dom'

export default function SettingsPage() {
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
		<PageWrapper className='settings-page'>
			<div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
				<h1>Настройки</h1>

				<div style={{ marginTop: '30px' }}>
					<h2>Уведомления</h2>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
						<label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
							<input type='checkbox' defaultChecked onChange={handleEmailToggle} />
							<span>Email уведомления</span>
						</label>
						<label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
							<input type='checkbox' defaultChecked onChange={handlePushToggle} />
							<span>Push уведомления</span>
						</label>
					</div>
				</div>

				<div style={{ marginTop: '30px' }}>
					<h2>Безопасность</h2>
					<button
						onClick={handlePasswordChange}
						style={{
							padding: '10px 20px',
							background: '#dc3545',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Сменить пароль
					</button>
				</div>

				<div style={{ marginTop: '30px' }}>
					<h2>Тест уведомлений</h2>
					<button
						onClick={handleTestToasts}
						style={{
							padding: '10px 20px',
							background: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Показать все типы уведомлений
					</button>
				</div>

				<div style={{ marginTop: '20px' }}>
					<Link to={ROUTES.HOME} style={{ color: '#007bff', textDecoration: 'none' }}>
						← Назад на главную
					</Link>
				</div>
			</div>
		</PageWrapper>
	)
}
