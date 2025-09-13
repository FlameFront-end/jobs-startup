import { createContext, type ReactNode, useContext, useEffect } from 'react'

import { env } from '@/shared/model/config'

import { ga4Service } from './ga4.service'

interface AnalyticsContextType {
	trackClick: (element: string, category: string, label?: string, elementType?: string) => void
	trackCustomEvent: (
		eventName: string,
		category?: string,
		label?: string,
		value?: number,
		customParams?: Record<string, unknown>
	) => void
	setUserId: (userId: string) => void
	setUserProperties: (properties: Record<string, unknown>) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

interface AnalyticsProviderProps {
	children: ReactNode
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
	const measurementId = env.GA4_MEASUREMENT_ID

	useEffect(() => {
		if (measurementId) {
			ga4Service.init()
		}
	}, [measurementId])

	const trackClick = (element: string, category: string, label?: string, elementType?: string) => {
		ga4Service.trackClick({
			event_category: category,
			event_label: label || element,
			element_type: elementType || 'button',
			page_path: window.location.pathname
		})
	}

	const trackCustomEvent = (
		eventName: string,
		category?: string,
		label?: string,
		value?: number,
		customParams?: Record<string, unknown>
	) => {
		ga4Service.trackCustomEvent({
			event_name: eventName,
			event_category: category,
			event_label: label,
			value,
			custom_parameters: customParams
		})
	}

	const setUserId = (userId: string) => {
		ga4Service.setUserId(userId)
	}

	const setUserProperties = (properties: Record<string, any>) => {
		ga4Service.setUserProperties(properties)
	}

	return (
		<AnalyticsContext.Provider
			value={{
				trackClick,
				trackCustomEvent,
				setUserId,
				setUserProperties
			}}
		>
			{children}
		</AnalyticsContext.Provider>
	)
}

export const useAnalyticsContext = () => {
	const context = useContext(AnalyticsContext)
	if (!context) {
		throw new Error('useAnalyticsContext must be used within AnalyticsProvider')
	}
	return context
}
