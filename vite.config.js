import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxies = {
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

