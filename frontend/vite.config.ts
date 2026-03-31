import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
      '/safety': 'http://localhost:3000',
      '/mental-health': 'http://localhost:3000',
      '/legal': 'http://localhost:3000',
      '/financial': 'http://localhost:3000',
      '/career': 'http://localhost:3000',
      '/community': 'http://localhost:3000',
    },
  },
})
