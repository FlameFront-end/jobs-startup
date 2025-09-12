import { PageWrapper } from '@/shared/ui/page-wrapper'

export default function ProfilePage() {
	return (
		<PageWrapper className='profile-page'>
			<div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
				<h1>Профиль</h1>
				<div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
					<div
						style={{
							width: '100px',
							height: '100px',
							background: '#ddd',
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						Фото
					</div>
					<div>
						<h2>Иван Иванов</h2>
						<p>Frontend Developer</p>
						<p>ivan@example.com</p>
					</div>
				</div>

				<div style={{ marginTop: '30px' }}>
					<h2>Настройки</h2>
					<form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
						<input
							type='text'
							placeholder='Имя'
							defaultValue='Иван'
							style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
						/>
						<input
							type='email'
							placeholder='Email'
							defaultValue='ivan@example.com'
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
								cursor: 'pointer',
								width: 'fit-content'
							}}
						>
							Сохранить изменения
						</button>
					</form>
				</div>

				<div style={{ marginTop: '20px' }}>
					<a href='/' style={{ color: '#007bff', textDecoration: 'none' }}>
						← Назад на главную
					</a>
				</div>
			</div>
		</PageWrapper>
	)
}
