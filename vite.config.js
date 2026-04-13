import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import RubyPlugin from 'vite-plugin-ruby'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    RubyPlugin(),
  ],
  resolve: {
    alias: {
      '@': '/app/frontend',
    },
  },
})
