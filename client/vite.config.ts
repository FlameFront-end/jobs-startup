import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	base: '/',
	plugins: [react(), tsconfigPaths()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	server: {
		host: true
	},
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
		sourcemap: false,
		minify: 'terser',
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					router: ['react-router-dom'],
					state: ['@reduxjs/toolkit', 'react-redux']
				}
			}
		}
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "@/shared/styles/variables" as *;`
			}
		}
	}
})
