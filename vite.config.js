import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import svgr from '@svgr/rollup'

// ESM-safe __dirname replacement
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
    },
  },

  plugins: [
    react(),
    svgr({ exportAsDefault: true }),
  ],
})
