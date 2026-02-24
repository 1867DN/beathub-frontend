import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Product images are in public/products/ — Vite copies public/ to dist/ automatically.
// URLs like /products/marca/imagen.png work in both dev and production without any plugin.

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
