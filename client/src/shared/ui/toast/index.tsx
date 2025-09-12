import styles from './toast.module.scss'

import { useCallback, useEffect, useRef, useState } from 'react'

import clsx from 'clsx'

import { useTheme } from '@/shared/lib/hooks/useTheme'
import { Icon } from '@/shared/ui/icon'

export interface ToastProps {
	id: string
	title?: string
	description?: string
	type: 'success' | 'error' | 'warning' | 'info' | 'loading'
	duration?: number
	closable?: boolean
	action?: {
		label: string
		onClick: () => void
	}
	onClose: (id: string) => void
}

export function Toast({ id, title, description, type, duration = 5000, closable = true, action, onClose }: ToastProps) {
	const { isDark } = useTheme()
	const [visible, setVisible] = useState(false)
	const [exiting, setExiting] = useState(false)
	const [isPaused, setIsPaused] = useState(false)
	const [progressWidth, setProgressWidth] = useState(100)
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
	const progressRef = useRef<NodeJS.Timeout | undefined>(undefined)

	const handleClose = useCallback(() => {
		setExiting(true)
		setTimeout(() => {
			onClose(id)
		}, 300)
	}, [id, onClose])

	useEffect(() => {
		setVisible(true)

		if (type === 'loading') return

		if (duration > 0) {
			timeoutRef.current = setTimeout(() => {
				handleClose()
			}, duration)

			const startTime = Date.now()
			const updateProgress = () => {
				if (isPaused) return

				const elapsed = Date.now() - startTime
				const remaining = Math.max(0, duration - elapsed)
				const width = (remaining / duration) * 100
				setProgressWidth(width)

				if (remaining > 0) {
					progressRef.current = setTimeout(updateProgress, 16)
				}
			}
			updateProgress()
		}

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
			if (progressRef.current) clearTimeout(progressRef.current)
		}
	}, [duration, type, handleClose, isPaused])

	const handleActionClick = useCallback(() => {
		action?.onClick()
		handleClose()
	}, [action, handleClose])

	const handleMouseEnter = useCallback(() => {
		if (isPaused) return
		setIsPaused(true)
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}
	}, [isPaused])

	const getIcon = () => {
		return <Icon name={type} className={clsx(type === 'loading' && styles.spinning)} />
	}

	const toastClass = clsx(
		styles.toast,
		visible && !exiting && styles.visible,
		exiting && styles.exiting,
		!isDark && styles.lightTheme
	)

	return (
		<div className={toastClass} onMouseEnter={handleMouseEnter}>
			<div className={styles.content}>
				<div className={styles.mainContent}>
					<div className={clsx(styles.indicator, styles[type])} />
					<div className={clsx(styles.icon, styles[type])}>{getIcon()}</div>
					<div className={styles.textContent}>
						{title && <div className={styles.title}>{title}</div>}
						{description && <div className={styles.description}>{description}</div>}
					</div>
				</div>

				<div className={styles.actions}>
					{action && (
						<button className={styles.actionButton} onClick={handleActionClick}>
							{action.label}
						</button>
					)}
					{closable && (
						<button className={styles.closeButton} onClick={handleClose}>
							x
						</button>
					)}
				</div>
			</div>

			{type !== 'loading' && duration > 0 && (
				<div className={styles.progressBar} style={{ width: `${progressWidth}%` }} />
			)}
		</div>
	)
}
