const validateEnv = () => {
	const requiredVars = ['VITE_API_URL', 'VITE_GA4_MEASUREMENT_ID'] as const
	const missing = requiredVars.filter(key => !import.meta.env[key])

	if (missing.length > 0) {
		console.warn(`Missing environment variables: ${missing.join(', ')}`)
		console.warn('Using default values')
	}
}

validateEnv()

export const env = {
	API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
	NODE_ENV: import.meta.env.MODE || 'development',
	IS_DEV: import.meta.env.DEV,
	IS_PROD: import.meta.env.PROD,
	SERVICE_NAME: import.meta.env.VITE_SERVICE_NAME || 'jobs-client',
	LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
	GA4_MEASUREMENT_ID: import.meta.env.VITE_GA4_MEASUREMENT_ID || ''
} as const
