let toastInstance: {
	success: (message: string, title?: string) => void
	error: (message: string, title?: string) => void
	warning: (message: string, title?: string) => void
	info: (message: string, title?: string) => void
	loading: (message: string, title?: string) => void
} | null = null

export const setToastInstance = (instance: typeof toastInstance) => {
	toastInstance = instance
}

export const toastService = {
	success: (message: string, title?: string) => {
		toastInstance?.success(message, title)
	},
	error: (message: string, title?: string) => {
		toastInstance?.error(message, title)
	},
	warning: (message: string, title?: string) => {
		toastInstance?.warning(message, title)
	},
	info: (message: string, title?: string) => {
		toastInstance?.info(message, title)
	},
	loading: (message: string, title?: string) => {
		toastInstance?.loading(message, title)
	}
}
