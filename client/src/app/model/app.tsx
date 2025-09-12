import { useEffect, useState } from 'react'

import { RouterProvider } from 'react-router-dom'

import { PageLoader } from '@/shared/kit'

import { Providers } from './providers'
import { router } from './router'

export const App = () => {
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 3000)

		return () => clearTimeout(timer)
	}, [])

	if (isLoading) {
		return <PageLoader />
	}

	return (
		<Providers>
			<RouterProvider router={router} />
		</Providers>
	)
}
