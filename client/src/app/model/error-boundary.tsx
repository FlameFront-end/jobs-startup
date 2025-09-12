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
		<div style={{ padding: '2rem', textAlign: 'center' }}>
			<div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
			<h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-color)' }}>Произошла ошибка</h1>
			<p style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>
				Что-то пошло не так. Мы уже работаем над исправлением.
			</p>

			{error && (
				<div style={{ marginBottom: '2rem', textAlign: 'left' }}>
					<div style={{ marginBottom: '1rem' }}>
						<strong>Ошибка:</strong> {error.message}
					</div>

					{error.stack && (
						<div style={{ marginBottom: '1rem' }}>
							<details>
								<summary>Стек вызовов</summary>
								<pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>{error.stack}</pre>
							</details>
						</div>
					)}

					<button
						onClick={onOpenEditor}
						disabled={!error.stack}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: 'var(--primary-color)',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
							marginRight: '1rem'
						}}
					>
						Открыть в редакторе
					</button>
				</div>
			)}

			<div>
				<button
					onClick={onReload}
					style={{
						padding: '0.75rem 1.5rem',
						backgroundColor: 'var(--primary-color)',
						color: 'white',
						border: 'none',
						borderRadius: '6px',
						cursor: 'pointer',
						marginRight: '1rem',
						fontSize: '1rem'
					}}
				>
					Перезагрузить страницу
				</button>
				<button
					onClick={onGoHome}
					style={{
						padding: '0.75rem 1.5rem',
						backgroundColor: 'transparent',
						color: 'var(--text-color)',
						border: '1px solid var(--border-color)',
						borderRadius: '6px',
						cursor: 'pointer',
						fontSize: '1rem'
					}}
				>
					На главную
				</button>
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
