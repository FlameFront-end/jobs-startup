import styles from './full-screen-loader.module.scss'

import { clsx } from 'clsx'

interface FullScreenLoaderProps {
	message?: string
	className?: string
}

export const FullScreenLoader = ({ message, className }: FullScreenLoaderProps) => {
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
