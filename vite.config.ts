import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // `optimize: false` — Vite 8 minifies CSS with Lightning CSS and Tailwind v4 does too,
  // so leaving both on makes Tailwind emit duplicate-minification warnings.
  plugins: [react(), tailwindcss({ optimize: false })],
})
