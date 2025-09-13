import { useCallback } from 'react'

import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/shared/model/routes'

export const useNavigation = () => {
	const navigate = useNavigate()

	const goToLogin = useCallback(() => navigate(ROUTES.LOGIN), [navigate])
	const goToHome = useCallback(() => navigate(ROUTES.HOME), [navigate])
	const goToDashboard = useCallback(() => navigate(ROUTES.DASHBOARD), [navigate])
	const goToJobs = useCallback(() => navigate(ROUTES.JOBS), [navigate])
	const goToProfile = useCallback(() => navigate(ROUTES.PROFILE), [navigate])
	const goToSettings = useCallback(() => navigate(ROUTES.SETTINGS), [navigate])

	return {
		navigate,
		goToLogin,
		goToHome,
		goToDashboard,
		goToJobs,
		goToProfile,
		goToSettings
	}
}
