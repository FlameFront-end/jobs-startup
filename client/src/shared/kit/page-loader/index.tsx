import styles from './page-loader.module.scss'

import { clsx } from 'clsx'

interface PageLoaderProps {
	message?: string
	className?: string
}

export const PageLoader = ({ message, className }: PageLoaderProps) => {
	return (
		<div className={clsx(styles.pageLoader, className)}>
			<div className={styles.pageLoader__animation}>
				<div className={styles.pageLoader__spinner} />
				<div className={styles.pageLoader__center} />
			</div>
			{message && <p className={styles.pageLoader__message}>{message}</p>}
		</div>
	)
}
