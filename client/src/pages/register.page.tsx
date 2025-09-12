import { PageWrapper } from '@/shared/ui/page-wrapper'

export default function RegisterPage() {
	return (
		<PageWrapper className='register-page'>
			<div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
				<h1>Регистрация</h1>
				<form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
					<input
						type='text'
						placeholder='Имя'
						style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
					/>
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
							background: '#28a745',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Зарегистрироваться
					</button>
				</form>
				<div style={{ marginTop: '20px' }}>
					<a href='/' style={{ color: '#007bff', textDecoration: 'none' }}>
						← Назад на главную
					</a>
				</div>
			</div>
		</PageWrapper>
	)
}
