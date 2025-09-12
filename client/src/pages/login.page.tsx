import { ROUTES } from '@/shared/model/routes'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { Link } from 'react-router-dom'

export default function LoginPage() {
	return (
		<PageWrapper className='login-page'>
			<div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
				<h1>Вход в систему</h1>
				<form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
					<input
						type='email'
						placeholder='Email'
						style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
					/>
					<input
						type='password'
						placeholder='Пароль'
						style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
					/>
					<button
						type='submit'
						style={{
							padding: '10px',
							background: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Войти
					</button>
				</form>
				<div style={{ marginTop: '20px' }}>
					<Link to={ROUTES.HOME} style={{ color: '#007bff', textDecoration: 'none' }}>
						← Назад на главную
					</Link>
				</div>
			</div>
		</PageWrapper>
	)
}
