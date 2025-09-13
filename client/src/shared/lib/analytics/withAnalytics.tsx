import { type ComponentType, type MouseEvent } from 'react'

import { useAnalytics } from '../hooks/useAnalytics'

interface WithAnalyticsProps {
	analyticsCategory?: string
	analyticsLabel?: string
	analyticsElementType?: string
}

export function withAnalytics<P extends object>(
	WrappedComponent: ComponentType<P>,
	defaultCategory: string = 'interaction'
) {
	const ComponentWithAnalytics = (props: P & WithAnalyticsProps) => {
		const { trackClick } = useAnalytics()
		const { analyticsCategory, analyticsLabel, analyticsElementType, ...restProps } = props

		const handleClick = (event: MouseEvent) => {
			const target = event.currentTarget as HTMLElement
			const elementName =
				target.getAttribute('data-analytics-name') || target.textContent?.trim() || target.tagName.toLowerCase()

			trackClick(
				elementName,
				analyticsCategory || defaultCategory,
				analyticsLabel || elementName,
				analyticsElementType || target.tagName.toLowerCase()
			)

			if ('onClick' in props && typeof props.onClick === 'function') {
				props.onClick(event)
			}
		}

		return <WrappedComponent {...(restProps as P)} onClick={handleClick} />
	}

	ComponentWithAnalytics.displayName = `withAnalytics(${WrappedComponent.displayName || WrappedComponent.name})`

	return ComponentWithAnalytics
}
