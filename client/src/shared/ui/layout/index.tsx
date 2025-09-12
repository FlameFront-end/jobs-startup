import styles from './layout.module.scss'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'

import { useAppSelector } from '@/shared/lib/store'

export function Layout() {
	const location = useLocation()
	const animationsEnabled = useAppSelector(state => state.app.animationsEnabled)

	const pageVariants = {
		initial: {
			opacity: 0
		},
		in: {
			opacity: 1
		},
		out: {
			opacity: 0
		}
	}

	const pageTransition = {
		type: 'tween' as const,
		ease: 'easeOut' as const,
		duration: animationsEnabled ? 0.1 : 0
	}

	return (
		<AnimatePresence mode='wait'>
			<motion.div
				key={location.pathname}
				initial={animationsEnabled ? 'initial' : false}
				animate='in'
				exit={animationsEnabled ? 'out' : undefined}
				variants={animationsEnabled ? pageVariants : {}}
				transition={pageTransition}
				className={clsx(styles.layoutContainer)}
			>
				<Outlet />
			</motion.div>
		</AnimatePresence>
	)
}
