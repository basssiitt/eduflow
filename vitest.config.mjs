import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'threads',
    fileParallelism: false,
    isolate: false,
    alias: {
      '@': path.resolve(import.meta.dirname, './'),
    },
  },
})
