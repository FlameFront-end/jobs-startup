import styles from './page-wrapper.module.scss'

import clsx from 'clsx'

interface PageWrapperProps {
	children: React.ReactNode
	className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
	return <div className={clsx(styles.pageWrapper, className)}>{children}</div>
}
