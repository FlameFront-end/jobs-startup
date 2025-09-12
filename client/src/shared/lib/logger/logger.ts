interface LogData {
	[key: string]: any
}

class BrowserLogger {
	private formatMessage(level: string, message: string, data?: LogData): string {
		const timestamp = new Date().toISOString()
		const service = 'jobs-client'

		if (data) {
			return `[${timestamp}] ${level.toUpperCase()} [${service}] ${message} ${JSON.stringify(data)}`
		}

		return `[${timestamp}] ${level.toUpperCase()} [${service}] ${message}`
	}

	info(message: string, data?: LogData): void {
		console.info(this.formatMessage('info', message, data))
	}

	error(message: string, data?: LogData): void {
		console.error(this.formatMessage('error', message, data))
	}

	warn(message: string, data?: LogData): void {
		console.warn(this.formatMessage('warn', message, data))
	}

	debug(message: string, data?: LogData): void {
		console.debug(this.formatMessage('debug', message, data))
	}
}

const logger = new BrowserLogger()

export { logger }
