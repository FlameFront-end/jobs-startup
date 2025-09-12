import { ROUTES } from '@/shared/model/routes'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { Link } from 'react-router-dom'

export default function JobsPage() {
	const jobs = [
		{ id: 1, title: 'Frontend Developer', company: 'Tech Corp', salary: '100k-150k' },
		{ id: 2, title: 'Backend Developer', company: 'Startup Inc', salary: '80k-120k' },
		{ id: 3, title: 'Full Stack Developer', company: 'Big Company', salary: '120k-180k' }
	]

	return (
		<PageWrapper className='jobs-page'>
			<div style={{ padding: '20px' }}>
				<h1>Вакансии</h1>

				<div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
					{jobs.map(job => (
						<div
							key={job.id}
							style={{
								padding: '15px',
								border: '1px solid #ddd',
								borderRadius: '8px',
								background: '#f9f9f9'
							}}
						>
							<h3>{job.title}</h3>
							<p>
								<strong>Компания:</strong> {job.company}
							</p>
							<p>
								<strong>Зарплата:</strong> {job.salary}
							</p>
						</div>
					))}
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
