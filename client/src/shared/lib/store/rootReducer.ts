import { combineReducers } from '@reduxjs/toolkit'
import appReducer from './slices/appSlice'

export const rootReducer = combineReducers({
	app: appReducer
})
