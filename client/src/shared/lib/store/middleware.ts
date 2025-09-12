import { createLogger } from 'redux-logger'

import { env } from '@/shared/config/env'

const logger = createLogger({
	collapsed: true,
	diff: true
})

export const middleware = env.IS_DEV ? [logger] : []
