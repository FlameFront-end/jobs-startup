import { useAppSelector } from '@/shared/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'

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
				style={{
					width: '100%',
					height: '100%',
					position: 'relative'
				}}
			>
				<Outlet />
			</motion.div>
		</AnimatePresence>
	)
}
