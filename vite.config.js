import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/jisho': {
        target: 'https://jisho.org/api/v1/search/words',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jisho/, '')
      }
    }
  }
})
