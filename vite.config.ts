import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Ensure correct MIME type for WASM files during development
      '*.wasm': {
        'Content-Type': 'application/wasm',
      },
    },
  },
  optimizeDeps: {
    exclude: ['@libsql/client'],
  },
})