import { configureStore } from '@reduxjs/toolkit'

import { env } from '@/shared/model/config'

import { middleware } from './middleware'
import { rootReducer } from './rootReducer'

export const store = configureStore({
	reducer: rootReducer,
	middleware: getDefaultMiddleware => getDefaultMiddleware().concat(middleware),
	devTools: !env.IS_PROD
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export { useAppDispatch, useAppSelector } from './hooks'
