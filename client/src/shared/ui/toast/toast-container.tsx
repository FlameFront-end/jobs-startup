import styles from './toast-container.module.scss'

import { Toast, type ToastProps } from './index'

interface ToastContainerProps {
	toasts: ToastProps[]
	onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
	return (
		<div className={styles.container}>
			{toasts.map(toast => (
				<div key={toast.id} className={styles.toast}>
					<Toast {...toast} onClose={onClose} />
				</div>
			))}
		</div>
	)
}
