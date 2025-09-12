import styles from './button.module.scss'

import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'

import clsx from 'clsx'

interface BaseButtonProps {
	variant?:
		| 'default'
		| 'success'
		| 'error'
		| 'warning'
		| 'info'
		| 'loading'
		| 'enabled'
		| 'disabled'
		| 'text'
		| 'link'
	size?: 'sm' | 'md' | 'lg'
	width?: 'auto' | 'fit' | 'full' | 'half'
	className?: string
}

interface ButtonAsButtonProps extends BaseButtonProps, ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode
	href?: never
}

interface ButtonAsLinkProps extends BaseButtonProps, AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode
	href: string
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps

export const Button = ({
	children,
	variant = 'default',
	size = 'md',
	width = 'auto',
	className,
	href,
	...props
}: ButtonProps) => {
	if (href) {
		return (
			<a
				href={href}
				className={clsx(
					styles.button,
					styles[variant],
					styles[size],
					styles[`width${width.charAt(0).toUpperCase() + width.slice(1)}`],
					className
				)}
				{...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
			>
				{children}
			</a>
		)
	}

	return (
		<button
			className={clsx(
				styles.button,
				styles[variant],
				styles[size],
				styles[`width${width.charAt(0).toUpperCase() + width.slice(1)}`],
				className
			)}
			{...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
		>
			{children}
		</button>
	)
}
