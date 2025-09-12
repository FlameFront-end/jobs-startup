import { ROUTES } from '@/shared/model/routes'
import { Layout } from '@/shared/ui/layout'
import { createBrowserRouter } from 'react-router-dom'
import { Providers } from './providers'

export const router = createBrowserRouter([
	{
		element: (
			<Providers>
				<Layout />
			</Providers>
		),
		children: [
			{
				path: ROUTES.HOME,
				lazy: () => import('../pages/home.page').then(module => ({ Component: module.default }))
			},
			{
				path: ROUTES.LOGIN,
				lazy: () => import('../pages/login.page').then(module => ({ Component: module.default }))
			},
			{
				path: ROUTES.REGISTER,
				lazy: () => import('../pages/register.page').then(module => ({ Component: module.default }))
			},
			{
				path: ROUTES.DASHBOARD,
				lazy: () => import('../pages/dashboard.page').then(module => ({ Component: module.default }))
			},
			{
				path: ROUTES.JOBS,
				lazy: () => import('../pages/jobs.page').then(module => ({ Component: module.default }))
			},
			{
				path: ROUTES.JOB_DETAILS,
				lazy: () => import('../pages/job-details.page').then(module => ({ Component: module.default }))
			},
			{
				path: ROUTES.PROFILE,
				lazy: () => import('../pages/profile.page').then(module => ({ Component: module.default }))
			},
			{
				path: ROUTES.SETTINGS,
				lazy: () => import('../pages/settings.page').then(module => ({ Component: module.default }))
			}
		]
	}
])
