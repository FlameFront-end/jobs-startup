import styles from './card.module.scss'

import { type ReactNode } from 'react'

import clsx from 'clsx'

interface CardProps {
	title?: string
	children: ReactNode
	className?: string
	titleClassName?: string
	contentClassName?: string
	variant?: 'default' | 'outlined' | 'filled' | 'elevated' | 'plain'
	size?: 'sm' | 'md' | 'lg'
	width?: 'auto' | 'fit' | 'full' | 'half' | 'third' | 'quarter'
	background?: 'default' | 'light' | 'dark' | 'primary' | 'success' | 'warning' | 'error'
	onClick?: () => void
	disabled?: boolean
}

export const Card = ({
	title,
	children,
	className,
	titleClassName,
	contentClassName,
	variant = 'default',
	size = 'md',
	width = 'full',
	background = 'default',
	onClick,
	disabled = false
}: CardProps) => {
	return (
		<div
			className={clsx(
				styles.card,
				styles[variant],
				styles[size],
				styles[`width${width.charAt(0).toUpperCase() + width.slice(1)}`],
				styles[`bg${background.charAt(0).toUpperCase() + background.slice(1)}`],
				{
					[styles.clickable]: onClick,
					[styles.disabled]: disabled
				},
				className
			)}
			onClick={disabled ? undefined : onClick}
		>
			{title && <h2 className={clsx(styles.title, titleClassName)}>{title}</h2>}

			<div className={clsx(styles.content, contentClassName)}>{children}</div>
		</div>
	)
}
