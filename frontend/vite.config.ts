import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Health Tracker',
        short_name: 'HealthTracker',
        description: "Women's Health Tracking Application",
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#e84393',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/(auth|cycles|symptoms|moods|reminders|ai)\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/cycles': 'http://localhost:3000',
      '/symptoms': 'http://localhost:3000',
      '/moods': 'http://localhost:3000',
      '/reminders': 'http://localhost:3000',
      '/ai': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
})
