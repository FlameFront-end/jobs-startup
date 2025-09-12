export const ButtonVariant = {
	DEFAULT: 'default',
	SUCCESS: 'success',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info',
	LOADING: 'loading',
	ENABLED: 'enabled',
	DISABLED: 'disabled',
	TEXT: 'text',
	LINK: 'link'
} as const

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant]
