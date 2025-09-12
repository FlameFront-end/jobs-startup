import { ROUTES } from '@/shared/model/routes'
import { Link } from 'react-router-dom'
import styles from './not-found.page.module.scss'

export const NotFoundPage = () => {
	return (
		<div className={styles.notFoundPage}>
			<div className={styles.notFoundContainer}>
				<div className={styles.errorCode}>404</div>
				<div className={styles.errorTitle}>Страница не найдена</div>
				<div className={styles.errorDescription}>
					К сожалению, запрашиваемая страница не существует или была перемещена.
				</div>
				<div className={styles.errorActions}>
					<Link to={ROUTES.HOME} className={styles.btnPrimary}>
						Вернуться на главную
					</Link>
					<button className={styles.btnSecondary} onClick={() => window.history.back()}>
						Назад
					</button>
				</div>
			</div>
		</div>
	)
}
