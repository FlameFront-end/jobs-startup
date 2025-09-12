import styles from './icon.module.scss'

import clsx from 'clsx'

interface IconProps {
	name: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'close'
	className?: string
}

export function Icon({ name, className }: IconProps) {
	return (
		<div
			className={clsx(styles.icon, styles[name], className)}
			style={{
				WebkitMaskImage: `url(/icons/${name}.svg)`,
				maskImage: `url(/icons/${name}.svg)`,
				WebkitMaskSize: 'contain',
				maskSize: 'contain',
				WebkitMaskRepeat: 'no-repeat',
				maskRepeat: 'no-repeat',
				WebkitMaskPosition: 'center',
				maskPosition: 'center'
			}}
		/>
	)
}
