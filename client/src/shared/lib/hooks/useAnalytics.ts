import { useCallback, useEffect, useRef } from 'react'

import { useLocation } from 'react-router-dom'

import { useAnalyticsContext } from '../analytics/analytics-provider'

export const useAnalytics = () => {
	const location = useLocation()
	const pageStartTime = useRef<number>(Date.now())
	const currentPage = useRef<string>(location.pathname)
	const {
		trackClick: contextTrackClick,
		trackCustomEvent: contextTrackCustomEvent,
		setUserId: contextSetUserId,
		setUserProperties: contextSetUserProperties
	} = useAnalyticsContext()

	useEffect(() => {
		const timeSpent = Date.now() - pageStartTime.current

		if (currentPage.current !== location.pathname) {
			contextTrackCustomEvent('user_engagement', 'engagement', 'page_time', timeSpent, {
				page_path: currentPage.current
			})
			pageStartTime.current = Date.now()
			currentPage.current = location.pathname
		}

		contextTrackCustomEvent('page_view', 'navigation', location.pathname, undefined, {
			page_title: document.title,
			page_location: window.location.href,
			page_path: location.pathname
		})
	}, [location, contextTrackCustomEvent])

	const trackClick = useCallback(
		(element: string, category: string, label?: string, elementType: string = 'button') => {
			contextTrackClick(element, category, label, elementType)
		},
		[contextTrackClick]
	)

	const trackCustomEvent = useCallback(
		(
			eventName: string,
			category?: string,
			label?: string,
			value?: number,
			customParams?: Record<string, unknown>
		) => {
			contextTrackCustomEvent(eventName, category, label, value, customParams)
		},
		[contextTrackCustomEvent]
	)

	const setUserId = useCallback(
		(userId: string) => {
			contextSetUserId(userId)
		},
		[contextSetUserId]
	)

	const setUserProperties = useCallback(
		(properties: Record<string, unknown>) => {
			contextSetUserProperties(properties)
		},
		[contextSetUserProperties]
	)

	useEffect(() => {
		const handleBeforeUnload = () => {
			const timeSpent = Date.now() - pageStartTime.current
			contextTrackCustomEvent('user_engagement', 'engagement', 'page_time', timeSpent, {
				page_path: location.pathname
			})
		}

		window.addEventListener('beforeunload', handleBeforeUnload)
		return () => window.removeEventListener('beforeunload', handleBeforeUnload)
	}, [location.pathname, contextTrackCustomEvent])

	return {
		trackClick,
		trackCustomEvent,
		setUserId,
		setUserProperties
	}
}
