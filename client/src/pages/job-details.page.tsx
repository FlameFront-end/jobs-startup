import { PageWrapper } from '@/shared/ui/page-wrapper'

export default function JobDetailsPage() {
	return (
		<PageWrapper className='job-details-page'>
			<div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
				<h1>Frontend Developer</h1>
				<p>
					<strong>Компания:</strong> Tech Corp
				</p>
				<p>
					<strong>Зарплата:</strong> 100k-150k
				</p>
				<p>
					<strong>Локация:</strong> Москва
				</p>

				<div style={{ marginTop: '30px' }}>
					<h2>Описание</h2>
					<p>Мы ищем опытного Frontend разработчика для работы над современными веб-приложениями...</p>
				</div>

				<div style={{ marginTop: '30px' }}>
					<h2>Требования</h2>
					<ul>
						<li>React, TypeScript</li>
						<li>Опыт работы 3+ года</li>
						<li>Знание Redux, RTK Query</li>
					</ul>
				</div>

				<div style={{ marginTop: '30px' }}>
					<button
						style={{
							padding: '10px 20px',
							background: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
							marginRight: '10px'
						}}
					>
						Откликнуться
					</button>
					<button
						style={{
							padding: '10px 20px',
							background: '#6c757d',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Сохранить
					</button>
				</div>

				<div style={{ marginTop: '20px' }}>
					<a href='/jobs' style={{ color: '#007bff', textDecoration: 'none' }}>
						← Назад к вакансиям
					</a>
				</div>
			</div>
		</PageWrapper>
	)
}
