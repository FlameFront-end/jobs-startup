import { useNavigate, useRouteError } from 'react-router-dom'

import { ROUTES } from '@/shared/model/routes'
import { ErrorBoundaryContent } from '@/shared/widgets/error-boundary'

export function ErrorElement() {
	const error = useRouteError() as Error
	const navigate = useNavigate()

	const handleReload = () => {
		window.location.reload()
	}

	const handleGoHome = () => {
		navigate(ROUTES.HOME)
	}

	return (
		<ErrorBoundaryContent
			error={error}
			onReload={handleReload}
			onGoHome={handleGoHome}
		/>
	)
}
