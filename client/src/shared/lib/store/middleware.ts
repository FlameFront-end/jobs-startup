import { env } from '@/shared/config/env'
import { createLogger } from 'redux-logger'

const logger = createLogger({
	collapsed: true,
	diff: true
})

export const middleware = env.IS_DEV ? logger : []
