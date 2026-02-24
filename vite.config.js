import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Serve product images from src/assets/images/products/ under /products/
// This way images stay in their original location — no copying needed
function serveProductImages() {
  const imagesRoot = path.resolve(process.cwd(), 'src/assets/images/products')
  return {
    name: 'serve-product-images',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/products/')) {
          const relative = decodeURIComponent(req.url.replace('/products/', '').split('?')[0])
          const imgPath = path.join(imagesRoot, relative)
          if (fs.existsSync(imgPath) && fs.statSync(imgPath).isFile()) {
            const ext = path.extname(imgPath).toLowerCase()
            const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' }
            res.setHeader('Content-Type', mime[ext] || 'application/octet-stream')
            res.setHeader('Cache-Control', 'public, max-age=3600')
            fs.createReadStream(imgPath).pipe(res)
            return
          }
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), serveProductImages()],
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
