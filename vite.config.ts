import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const defaultPagesBase = repositoryName ? `/${repositoryName}/` : '/RelativityStream/'
const base = process.env.VITE_BASE_PATH
  ?? (process.env.GITHUB_ACTIONS === 'true' ? defaultPagesBase : '/')

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: './src/test/setup.ts',
  },
})
