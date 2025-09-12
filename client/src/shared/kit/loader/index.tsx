import styles from './loader.module.scss'

import { clsx } from 'clsx'

interface LoaderProps {
	size?: 'small' | 'medium' | 'large'
	className?: string
}

export const Loader = ({ size = 'medium', className }: LoaderProps) => {
	return (
		<div className={clsx(styles.loader, styles[`loader--${size}`], className)}>
			<div className={styles.loader__spinner} />
		</div>
	)
}
