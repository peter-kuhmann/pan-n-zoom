import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import url from "url"
import {VitePWA} from "vite-plugin-pwa";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{webp,png,svg,ico,html,js,ts,jsx,tsx,css,scss,ttf,woff,woff2}'],
    }
  })],
  resolve: {
    alias: {
      '@': url.fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  preview: {
    port: 4560
  }
})
