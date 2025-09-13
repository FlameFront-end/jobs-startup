import styles from './layout.module.scss'

import clsx from 'clsx'

import { PageTransition } from '../page-transition'

export function Layout() {
	return (
		<div className={clsx(styles.layoutContainer)}>
			<PageTransition />
		</div>
	)
}
