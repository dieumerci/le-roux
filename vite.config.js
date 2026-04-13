import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import RubyPlugin from 'vite-plugin-ruby'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      fastRefresh: true,
    }),
    RubyPlugin(),
  ],
  resolve: {
    alias: {
      '@': '/app/frontend',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@inertiajs/react'],
  },
})
