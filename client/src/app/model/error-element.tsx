import { useRouteError } from 'react-router-dom'

import { ROUTES } from '@/shared/model/routes'
import { ErrorBoundaryContent } from '@/shared/ui/error-boundary'

export function ErrorElement() {
	const error = useRouteError() as Error

	const handleReload = () => {
		window.location.reload()
	}

	const handleGoHome = () => {
		window.location.href = ROUTES.HOME
	}

	const handleOpenInEditor = () => {
		if (error?.stack) {
			const stackLines = error.stack.split('\n')
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

	return (
		<ErrorBoundaryContent
			error={error}
			onReload={handleReload}
			onGoHome={handleGoHome}
			onOpenEditor={handleOpenInEditor}
		/>
	)
}
