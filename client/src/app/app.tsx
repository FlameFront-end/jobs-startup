import { useEffect, useState } from 'react'

import { RouterProvider } from 'react-router-dom'

import { PageLoader } from '@/shared/kit'

import { Providers } from './model/providers'
import { router } from './model/router'

export const App = () => {
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 1000)

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
