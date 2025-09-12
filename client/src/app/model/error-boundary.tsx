import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

import { logger } from '@/shared/lib/logger'
import { ROUTES } from '@/shared/model/routes'
import { ErrorBoundaryContent } from '@/shared/ui/error-boundary'

interface Props {
	children: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
	errorInfo: ErrorInfo | null
}

export class ErrorBoundaryProvider extends Component<Props, State> {
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
