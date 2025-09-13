import { env } from '../../model/config'

export interface GA4Event {
	event_name: string
	event_category?: string
	event_label?: string
	value?: number
	custom_parameters?: Record<string, unknown>
}

export interface PageViewEvent {
	page_title: string
	page_location: string
	page_path: string
}

export interface ClickEvent {
	event_category: string
	event_label: string
	element_type: string
	page_path: string
	coordinates?: {
		x: number
		y: number
	}
}

class GA4Service {
	private measurementId: string
	private isInitialized = false

	constructor(measurementId: string) {
		this.measurementId = measurementId
	}

	init() {
		if (this.isInitialized) return

		if (!this.measurementId) {
			console.warn('GA4: No measurement ID provided, analytics disabled')
			return
		}

		const script = document.createElement('script')
		script.async = true
		script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`
		document.head.appendChild(script)

		window.dataLayer = window.dataLayer || []
		window.gtag =
			window.gtag ||
			function (...args: unknown[]) {
				window.dataLayer.push(args)
			}
		window.gtag('js', new Date())
		window.gtag('config', this.measurementId, {
			page_title: document.title,
			page_location: window.location.href
		})

		this.isInitialized = true
	}

	trackPageView(pageData: PageViewEvent) {
		if (!this.isInitialized) return

		window.gtag('event', 'page_view', {
			page_title: pageData.page_title,
			page_location: pageData.page_location,
			page_path: pageData.page_path
		})
	}

	trackClick(eventData: ClickEvent) {
		if (!this.isInitialized) {
			console.warn('GA4: Not initialized, click event not tracked')
			return
		}

		window.gtag('event', 'click', {
			event_category: eventData.event_category,
			event_label: eventData.event_label,
			element_type: eventData.element_type,
			page_path: eventData.page_path,
			coordinates: eventData.coordinates
		})
	}

	trackCustomEvent(eventData: GA4Event) {
		if (!this.isInitialized) return

		window.gtag('event', eventData.event_name, {
			event_category: eventData.event_category,
			event_label: eventData.event_label,
			value: eventData.value,
			...eventData.custom_parameters
		})
	}

	trackUserEngagement(timeSpent: number, pagePath: string) {
		if (!this.isInitialized) return

		window.gtag('event', 'user_engagement', {
			engagement_time_msec: timeSpent,
			page_path: pagePath
		})
	}

	setUserId(userId: string) {
		if (!this.isInitialized) return

		window.gtag('config', this.measurementId, {
			user_id: userId
		})
	}

	setUserProperties(properties: Record<string, unknown>) {
		if (!this.isInitialized) return

		window.gtag('event', 'user_properties', properties)
	}
}

export const ga4Service = new GA4Service(env.GA4_MEASUREMENT_ID)
