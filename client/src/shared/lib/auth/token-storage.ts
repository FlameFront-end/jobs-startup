import { storageUtils } from '@/shared/lib/storage'

const TOKEN_KEY = 'auth_token'

export const tokenStorage = {
	get: (): string | null => {
		const token = storageUtils.getString(TOKEN_KEY, '')
		return token || null
	},

	set: (token: string): void => {
		storageUtils.setString(TOKEN_KEY, token)
	},

	remove: (): void => {
		storageUtils.remove(TOKEN_KEY)
	},

	hasToken: (): boolean => {
		return tokenStorage.get() !== null
	}
}
