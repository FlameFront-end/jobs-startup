import { env } from '@/shared/model/config'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogData = Record<string, unknown>

interface LoggerConfig {
	serviceName: string
	logLevel: LogLevel
}

class BrowserLogger {
	private config: LoggerConfig

	constructor(config: LoggerConfig) {
		this.config = config
	}

	private formatMessage(level: string, message: string, data?: LogData): string {
		const timestamp = new Date().toISOString()
		const service = this.config.serviceName

		if (data) {
			return `[${timestamp}] ${level.toUpperCase()} [${service}] ${message} ${JSON.stringify(data)}`
		}

		return `[${timestamp}] ${level.toUpperCase()} [${service}] ${message}`
	}

	private shouldLog(level: LogLevel): boolean {
		const levels: Record<LogLevel, number> = {
			debug: 0,
			info: 1,
			warn: 2,
			error: 3
		}
		return levels[level] >= levels[this.config.logLevel]
	}

	info(message: string, data?: LogData): void {
		if (typeof message !== 'string' || message.trim().length === 0) {
			console.warn('Logger: message must be a non-empty string')
			return
		}

		if (this.shouldLog('info')) {
			console.info(this.formatMessage('info', message, data))
		}
	}

	error(message: string, data?: LogData): void {
		if (typeof message !== 'string' || message.trim().length === 0) {
			console.warn('Logger: message must be a non-empty string')
			return
		}

		if (this.shouldLog('error')) {
			console.error(this.formatMessage('error', message, data))
		}
	}

	warn(message: string, data?: LogData): void {
		if (typeof message !== 'string' || message.trim().length === 0) {
			console.warn('Logger: message must be a non-empty string')
			return
		}

		if (this.shouldLog('warn')) {
			console.warn(this.formatMessage('warn', message, data))
		}
	}

	debug(message: string, data?: LogData): void {
		if (typeof message !== 'string' || message.trim().length === 0) {
			console.warn('Logger: message must be a non-empty string')
			return
		}

		if (this.shouldLog('debug')) {
			console.debug(this.formatMessage('debug', message, data))
		}
	}
}

const logger = new BrowserLogger({
	serviceName: env.SERVICE_NAME,
	logLevel: env.LOG_LEVEL as LogLevel
})

export { logger }
