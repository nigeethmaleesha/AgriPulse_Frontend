import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxies = {
  '/module3-api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/module3-api/, ''),
  },
  '/module4-api': {
    target: 'http://localhost:8081',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/module4-api/, ''),
  },
  '/module1-api': {
    target: 'http://localhost:8082',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/module1-api/, ''),
  },
  '/module2-api': {
    target: 'http://localhost:8083',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/module2-api/, ''),
  },
  '/module5-api': {
    target: 'http://localhost:8084',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/module5-api/, ''),
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: proxies,
  },
  preview: {
    port: 4173,
    proxy: proxies,
  },
})
