import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const repositoryName = (() => {
  const repository = process.env.GITHUB_REPOSITORY
  if (!repository) {
    return undefined
  }

  const parts = repository.split('/')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return undefined
  }

  return parts[1]
})()
const defaultPagesBase = repositoryName ? `/${repositoryName}/` : '/'
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
