import { animated, useTransition } from '@react-spring/web'
import { Outlet, useLocation } from 'react-router-dom'

import { useAppSelector } from '@/shared/lib/store'

export function PageTransition() {
	const location = useLocation()
	const animationsEnabled = useAppSelector(state => state.app.animationsEnabled)

	const transitions = useTransition(location, {
		from: { opacity: 0 },
		enter: { opacity: 1 },
		leave: { opacity: 0 },
		config: {
			duration: animationsEnabled ? 120 : 0,
			tension: 500,
			friction: 40
		}
	})

	return transitions((style, _item) => (
		<animated.div
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				...style
			}}
		>
			<Outlet />
		</animated.div>
	))
}
