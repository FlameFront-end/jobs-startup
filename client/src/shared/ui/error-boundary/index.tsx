import styles from './error-boundary.module.scss'

interface ErrorBoundaryContentProps {
	error: Error | null
	onReload: () => void
	onGoHome: () => void
	onOpenEditor: () => void
}

export function ErrorBoundaryContent({ error, onReload, onGoHome, onOpenEditor }: ErrorBoundaryContentProps) {
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

						<button className={styles.btnOpenEditor} onClick={onOpenEditor} disabled={!error.stack}>
							Открыть в редакторе
						</button>
					</div>
				)}

				<div className={styles.errorActions}>
					<button className={styles.btnPrimary} onClick={onReload}>
						Перезагрузить страницу
					</button>
					<button className={styles.btnSecondary} onClick={onGoHome}>
						На главную
					</button>
				</div>
			</div>
		</div>
	)
}
