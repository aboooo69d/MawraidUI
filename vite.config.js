import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy: كل طلبات /api تذهب إلى الباك إند على المنفذ 8080 أثناء التطوير
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true, // السماح بأي host المعاينة (e2b.app)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
