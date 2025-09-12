import { createBrowserRouter } from 'react-router-dom'

import { NotFoundPage } from '@/features/error/pages/not-found/not-found.page'
import { ROUTES } from '@/shared/model/routes'
import { Layout } from '@/shared/ui/layout'

import { ErrorElement } from './error-element'

export const router = createBrowserRouter([
	{
		element: <Layout />,
		errorElement: <ErrorElement />,
		children: [
			{
				path: ROUTES.HOME,
				lazy: () => import('../../features/home/pages/home/home.page')
			},
			{
				path: ROUTES.LOGIN,
				lazy: () => import('../../features/auth/pages/login/login.page')
			},
			{
				path: ROUTES.REGISTER,
				lazy: () => import('../../features/auth/pages/register/register.page')
			},
			{
				path: ROUTES.DASHBOARD,
				lazy: () => import('../../features/dashboard/pages/dashboard/dashboard.page')
			},
			{
				path: ROUTES.JOBS,
				lazy: () => import('../../features/jobs/pages/jobs/jobs.page')
			},
			{
				path: ROUTES.JOB_DETAILS,
				lazy: () => import('../../features/jobs/pages/job-details/job-details.page')
			},
			{
				path: ROUTES.PROFILE,
				lazy: () => import('../../features/profile/pages/profile/profile.page')
			},
			{
				path: ROUTES.SETTINGS,
				lazy: () => import('../../features/settings/pages/settings/settings.page')
			},
			{
				path: ROUTES.TEST_ERROR,
				lazy: () => import('../../features/error/pages/test-error/test-error.page')
			},
			{
				path: ROUTES.SELECTION_DEMO,
				lazy: () => import('../../features/demo/pages/selection-demo/selection-demo.page')
			},
			{
				path: '*',
				element: <NotFoundPage />
			}
		]
	}
])
