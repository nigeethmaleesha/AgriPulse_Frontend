import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxies = {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
  '/module4-api': {
    target: 'http://localhost:8081',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/module4-api/, ''),
  },
  '/dispatch-api': {
    target: 'http://localhost:8082',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/dispatch-api/, ''),
  },
  '/module2-api': {
    target: 'http://localhost:8083',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/module2-api/, ''),
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