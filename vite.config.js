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
  server: {
    host: '127.0.0.1',
    port: 3036,
    strictPort: true,
    hmr: {
      host: '127.0.0.1',
      port: 3036,
    },
  },
  resolve: {
    alias: {
      '@': '/app/javascript',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@inertiajs/react'],
  },
})
