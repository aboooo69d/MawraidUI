import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy: كل طلبات /api تذهب إلى الباك إند أثناء التطوير (تجنباً لقيود CORS والكوكيز عبر HTTP)
export default defineConfig({
  plugins: [react()],
  test: {
    // تفعيل globals ليتعرّف @testing-library/react على afterEach ويشغّل cleanup التلقائي
    globals: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true, // السماح بأي host المعاينة (e2b.app)
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'https://mawraid-git-769853937937.europe-west1.run.app',
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: '',
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie']
            if (Array.isArray(setCookie)) {
              proxyRes.headers['set-cookie'] = setCookie.map((c) =>
                c.replace(/;\s*Secure/gi, '').replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
              )
            }
          })
        },
      },
    },
  },
})
