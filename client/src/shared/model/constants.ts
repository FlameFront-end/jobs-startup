export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		REFRESH: '/auth/refresh',
		LOGOUT: '/auth/logout',
		PROFILE: '/auth/profile'
	},
	JOBS: {
		LIST: '/jobs',
		DETAILS: '/jobs/:id',
		APPLY: '/jobs/:id/apply',
		FAVORITES: '/jobs/favorites'
	},
	USER: {
		PROFILE: '/user/profile',
		SETTINGS: '/user/settings',
		AVATAR: '/user/avatar'
	}
} as const

export const PAGINATION = {
	DEFAULT_PAGE: 1,
	DEFAULT_LIMIT: 10,
	MAX_LIMIT: 100,
	MIN_LIMIT: 1
} as const

export const STORAGE_KEYS = {
	TOKEN: 'auth_token',
	REFRESH_TOKEN: 'refresh_token',
	USER: 'user_data',
	THEME: 'theme',
	SETTINGS: 'app_settings'
} as const

export const VALIDATION_RULES = {
	PASSWORD_MIN_LENGTH: 6,
	PASSWORD_MAX_LENGTH: 128,
	NAME_MIN_LENGTH: 2,
	NAME_MAX_LENGTH: 50,
	EMAIL_MAX_LENGTH: 255,
	DESCRIPTION_MAX_LENGTH: 2000
} as const

export const UI_CONSTANTS = {
	TOAST_DURATION: 5000,
	DEBOUNCE_DELAY: 300,
	ANIMATION_DURATION: 200,
	LOADING_TIMEOUT: 10000
} as const
