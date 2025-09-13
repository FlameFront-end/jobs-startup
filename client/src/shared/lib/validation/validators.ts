export const validators = {
	required: <T>(value: T | null | undefined, fieldName: string): T => {
		if (value === null || value === undefined || value === '') {
			throw new Error(`${fieldName} is required`)
		}
		return value
	},

	nonEmptyString: (value: string, fieldName: string): string => {
		if (typeof value !== 'string' || value.trim().length === 0) {
			throw new Error(`${fieldName} must be a non-empty string`)
		}
		return value.trim()
	},

	number: (value: unknown, fieldName: string): number => {
		if (typeof value !== 'number' || isNaN(value)) {
			throw new Error(`${fieldName} must be a valid number`)
		}
		return value
	},

	positiveNumber: (value: unknown, fieldName: string): number => {
		const num = validators.number(value, fieldName)
		if (num <= 0) {
			throw new Error(`${fieldName} must be a positive number`)
		}
		return num
	},

	boolean: (value: unknown, fieldName: string): boolean => {
		if (typeof value !== 'boolean') {
			throw new Error(`${fieldName} must be a boolean`)
		}
		return value
	},

	oneOf: <T>(value: T, allowedValues: readonly T[], fieldName: string): T => {
		if (!allowedValues.includes(value)) {
			throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`)
		}
		return value
	},

	object: (value: unknown, fieldName: string): Record<string, unknown> => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new Error(`${fieldName} must be an object`)
		}
		return value as Record<string, unknown>
	},

	array: (value: unknown, fieldName: string): unknown[] => {
		if (!Array.isArray(value)) {
			throw new Error(`${fieldName} must be an array`)
		}
		return value
	}
}
