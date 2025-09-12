import { PageWrapper } from '@/shared/ui/page-wrapper'

export default function DashboardPage() {
	return (
		<PageWrapper className='dashboard-page'>
			<div style={{ padding: '20px' }}>
				<h1>Дашборд</h1>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
						gap: '20px',
						marginTop: '20px'
					}}
				>
					<div
						style={{
							padding: '20px',
							background: '#f0f8ff',
							borderRadius: '8px',
							border: '1px solid #ddd'
						}}
					>
						<h3>Статистика</h3>
						<p>Всего вакансий: 150</p>
						<p>Новых сегодня: 5</p>
					</div>
					<div
						style={{
							padding: '20px',
							background: '#f0fff0',
							borderRadius: '8px',
							border: '1px solid #ddd'
						}}
					>
						<h3>Активность</h3>
						<p>Откликов: 12</p>
						<p>Интервью: 3</p>
					</div>
					<div
						style={{
							padding: '20px',
							background: '#fff8f0',
							borderRadius: '8px',
							border: '1px solid #ddd'
						}}
					>
						<h3>Рекомендации</h3>
						<p>Подходящих: 8</p>
						<p>Сохраненных: 25</p>
					</div>
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
