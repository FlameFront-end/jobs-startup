import { ROUTES } from '@/shared/model/routes'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { Link } from 'react-router-dom'

export default function HomePage() {
	return (
		<PageWrapper className='home-page'>
			<div style={{ padding: '20px' }}>
				<h1>Главная страница</h1>

				<div style={{ marginTop: '20px' }}>
					<h2>Тестовые ссылки для проверки анимации:</h2>
					<nav style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
						<Link
							to={ROUTES.LOGIN}
							style={{
								padding: '8px 16px',
								background: '#007bff',
								color: 'white',
								textDecoration: 'none',
								borderRadius: '4px'
							}}
						>
							Вход
						</Link>
						<Link
							to={ROUTES.REGISTER}
							style={{
								padding: '8px 16px',
								background: '#28a745',
								color: 'white',
								textDecoration: 'none',
								borderRadius: '4px'
							}}
						>
							Регистрация
						</Link>
						<Link
							to={ROUTES.SETTINGS}
							style={{
								padding: '8px 16px',
								background: '#ffc107',
								color: 'black',
								textDecoration: 'none',
								borderRadius: '4px'
							}}
						>
							settings
						</Link>
						<Link
							to={ROUTES.JOBS}
							style={{
								padding: '8px 16px',
								background: '#17a2b8',
								color: 'white',
								textDecoration: 'none',
								borderRadius: '4px'
							}}
						>
							Вакансии
						</Link>
					</nav>
				</div>
			</div>
		</PageWrapper>
	)
}
