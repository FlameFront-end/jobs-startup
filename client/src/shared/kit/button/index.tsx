import styles from './button.module.scss'

import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react'

import clsx from 'clsx'

import { useAnalytics } from '@/shared/lib/hooks/useAnalytics'

import { ButtonVariant, type ButtonVariant as ButtonVariantType } from './types'

interface BaseButtonProps {
	variant?: ButtonVariantType
	size?: 'sm' | 'md' | 'lg'
	width?: 'auto' | 'fit' | 'full' | 'half'
	className?: string
	analyticsCategory?: string
	analyticsLabel?: string
	analyticsElementType?: string
}

interface ButtonAsButtonProps extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
	children: ReactNode
	href?: never
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

interface ButtonAsLinkProps extends BaseButtonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> {
	children: ReactNode
	href: string
	onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps

const isButtonProps = (props: ButtonProps): props is ButtonAsButtonProps => {
	return !('href' in props)
}

export const Button = (props: ButtonProps) => {
	const {
		children,
		variant = ButtonVariant.DEFAULT,
		size = 'md',
		width = 'auto',
		className,
		analyticsCategory,
		analyticsLabel,
		analyticsElementType = 'button',
		...restProps
	} = props

	const { trackClick } = useAnalytics()

	const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
		if (analyticsCategory) {
			const elementName = analyticsLabel || (typeof children === 'string' ? children : 'button')
			trackClick(elementName, analyticsCategory, analyticsLabel, analyticsElementType)
		}

		if (isButtonProps(props) && props.onClick) {
			props.onClick(event)
		}
	}

	const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
		if (analyticsCategory) {
			const elementName = analyticsLabel || (typeof children === 'string' ? children : 'button')
			trackClick(elementName, analyticsCategory, analyticsLabel, analyticsElementType)
		}

		if (!isButtonProps(props) && props.onClick) {
			props.onClick(event)
		}
	}

	if (!isButtonProps(props)) {
		return (
			<a
				href={props.href}
				className={clsx(
					styles.button,
					styles[variant],
					styles[size],
					styles[`width${width.charAt(0).toUpperCase() + width.slice(1)}`],
					className
				)}
				onClick={handleLinkClick}
				{...(restProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
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
			onClick={handleButtonClick}
			{...(restProps as ButtonHTMLAttributes<HTMLButtonElement>)}
		>
			{children}
		</button>
	)
}
