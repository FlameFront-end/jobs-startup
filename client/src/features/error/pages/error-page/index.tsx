import styles from './error-page.module.scss'

import { useNavigate, useRouteError } from 'react-router-dom'

import { ROUTES } from '@/shared/model/routes'

interface ErrorPageProps {
	error?: Error | null
	onReload?: () => void
	onGoHome?: () => void
}

export function ErrorPage({ error: propError, onReload, onGoHome }: ErrorPageProps) {
	const routeError = useRouteError() as Error | undefined
	const navigate = useNavigate()

	const error = propError || routeError

	const handleReload = () => {
		if (onReload) {
			onReload()
		} else {
			window.location.reload()
		}
	}

	const handleGoHome = () => {
		if (onGoHome) {
			onGoHome()
		} else {
			navigate(ROUTES.HOME)
		}
	}

	return (
		<div className={styles.errorBoundaryPage}>
			<div className={styles.errorContainer}>
				<div className={styles.errorIcon}>⚠️</div>
				<div className={styles.errorTitle}>Произошла ошибка</div>
				<div className={styles.errorDescription}>Что-то пошло не так. Мы уже работаем над исправлением.</div>

				{error && (
					<div className={styles.errorDetails}>
						<div className={styles.errorMessage}>
							<strong>Ошибка:</strong> {error.message}
						</div>

						{error.stack && (
							<div className={styles.errorStack}>
								<details>
									<summary>Стек вызовов</summary>
									<pre>{error.stack}</pre>
								</details>
							</div>
						)}
					</div>
				)}

				<div className={styles.errorActions}>
					<button className={styles.btnPrimary} onClick={handleReload}>
						Перезагрузить страницу
					</button>
					<button className={styles.btnSecondary} onClick={handleGoHome}>
						На главную
					</button>
				</div>
			</div>
		</div>
	)
}
