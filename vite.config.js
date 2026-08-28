import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const module4Proxy = {
  '/module4-api': {
    target: 'http://localhost:8081',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/module4-api/, ''),
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: module4Proxy,
  },
  preview: {
    port: 4173,
    proxy: module4Proxy,
  },
})
