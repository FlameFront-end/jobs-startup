import styles from './error-boundary.module.scss'

import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

import { logger } from '@/shared/lib/logger'
import { ROUTES } from '@/shared/model/routes'

interface Props {
	children: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
	errorInfo: ErrorInfo | null
}

interface ErrorBoundaryContentProps {
	error: Error | null
	onReload: () => void
	onGoHome: () => void
	onOpenEditor: () => void
}

function ErrorBoundaryContent({ error, onReload, onGoHome, onOpenEditor }: ErrorBoundaryContentProps) {
	return (
		<div className={styles.errorBoundaryPage}>
			<div className={styles.errorContainer}>
				<div className={styles.errorIcon}>⚠️</div>
				<div className={styles.errorTitle}>Произошла ошибка</div>
				<div className={styles.errorDescription}>Что-то пошло не так. Мы уже работаем над исправлением.</div>

				{error && (
					<div className={styles.errorDetails}>
						<div className={styles.errorMessage}>
							<strong>Ошибка:</strong> {error.message}
						</div>

						{error.stack && (
							<div className={styles.errorStack}>
								<details>
									<summary>Стек вызовов</summary>
									<pre>{error.stack}</pre>
								</details>
							</div>
						)}

						<button className={styles.btnOpenEditor} onClick={onOpenEditor} disabled={!error.stack}>
							Открыть в редактореs
						</button>
					</div>
				)}

				<div className={styles.errorActions}>
					<button className={styles.btnPrimary} onClick={onReload}>
						Перезагрузить страницу
					</button>
					<button className={styles.btnSecondary} onClick={onGoHome}>
						На главную
					</button>
				</div>
			</div>
		</div>
	)
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null, errorInfo: null }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error, errorInfo: null }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		logger.error('React Error Boundary Caught Error', {
			error: error.message,
			stack: error.stack,
			componentStack: errorInfo.componentStack
		})

		this.setState({
			error,
			errorInfo
		})
	}

	handleReload = () => {
		window.location.reload()
	}

	handleGoHome = () => {
		this.setState({ hasError: false, error: null, errorInfo: null })
		window.location.href = ROUTES.HOME
	}

	handleOpenInEditor = () => {
		if (this.state.error?.stack) {
			const stackLines = this.state.error.stack.split('\n')
			const fileLine = stackLines.find(
				line => line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js')
			)

			if (fileLine) {
				const match = fileLine.match(/([^/\\]+\.(tsx?|jsx?)):(\d+):(\d+)/)
				if (match) {
					const [, fileName, , line, column] = match
					const vscodeUrl = `vscode://file/${window.location.origin.replace('http://', '').replace('https://', '')}/${fileName}:${line}:${column}`
					window.open(vscodeUrl, '_blank')
				}
			}
		}
	}

	render() {
		if (this.state.hasError) {
			return (
				<ErrorBoundaryContent
					error={this.state.error}
					onReload={this.handleReload}
					onGoHome={this.handleGoHome}
					onOpenEditor={this.handleOpenInEditor}
				/>
			)
		}

		return this.props.children
	}
}
