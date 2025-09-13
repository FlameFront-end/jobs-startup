const isLocalStorageAvailable = (): boolean => {
	try {
		const test = '__localStorage_test__'
		localStorage.setItem(test, test)
		localStorage.removeItem(test)
		return true
	} catch {
		return false
	}
}

export const storageUtils = {
	get: <T>(key: string, defaultValue: T): T => {
		if (typeof window === 'undefined' || !isLocalStorageAvailable()) return defaultValue

		try {
			const item = localStorage.getItem(key)
			return item ? JSON.parse(item) : defaultValue
		} catch (error) {
			console.warn(`Failed to get item from localStorage with key "${key}":`, error)
			return defaultValue
		}
	},

	set: <T>(key: string, value: T): void => {
		if (typeof window === 'undefined' || !isLocalStorageAvailable()) return

		try {
			localStorage.setItem(key, JSON.stringify(value))
		} catch (error) {
			console.warn(`Failed to set item in localStorage with key "${key}":`, error)
		}
	},

	remove: (key: string): void => {
		if (typeof window === 'undefined' || !isLocalStorageAvailable()) return

		try {
			localStorage.removeItem(key)
		} catch (error) {
			console.warn(`Failed to remove item from localStorage with key "${key}":`, error)
		}
	},

	getString: (key: string, defaultValue: string): string => {
		if (typeof window === 'undefined' || !isLocalStorageAvailable()) return defaultValue

		try {
			return localStorage.getItem(key) || defaultValue
		} catch (error) {
			console.warn(`Failed to get string from localStorage with key "${key}":`, error)
			return defaultValue
		}
	},

	setString: (key: string, value: string): void => {
		if (typeof window === 'undefined' || !isLocalStorageAvailable()) return

		try {
			localStorage.setItem(key, value)
		} catch (error) {
			console.warn(`Failed to set string in localStorage with key "${key}":`, error)
		}
	}
}
