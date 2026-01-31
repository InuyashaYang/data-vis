import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages deploys under /<repo>/ by default.
  // Override with VITE_BASE if you use a custom domain.
  base: process.env.VITE_BASE ?? '/',
})
