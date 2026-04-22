import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
 // ← MOVER ACÁ
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-silfab.png'],
      manifest: {
        name: 'SILFAB STO',
        short_name: 'SILFAB',
        description: 'Sistema de Servicio Técnico SILFAB',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/', // ← También cambiar scope
        start_url: '/', // ← Y start_url
        icons: [
          {
            src: '/icons/icon-192.png', // ← Actualizar rutas de iconos
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-pages',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
            }
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /\/api\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3
            }
          }
        ]
      }
    })
  ]
})