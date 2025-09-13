export const idGenerator = {
	generate: (prefix?: string): string => {
		const timestamp = Date.now().toString(36)
		const random = Math.random().toString(36).substring(2, 15)
		const id = `${timestamp}-${random}`
		return prefix ? `${prefix}-${id}` : id
	},

	generateShort: (prefix?: string): string => {
		const timestamp = Date.now().toString(36)
		const random = Math.random().toString(36).substring(2, 8)
		const id = `${timestamp}${random}`
		return prefix ? `${prefix}-${id}` : id
	}
}
