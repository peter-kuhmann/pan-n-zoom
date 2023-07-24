import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import url from "url"
import {VitePWA} from "vite-plugin-pwa";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{webp,png,svg,ico,html,js,ts,jsx,tsx,css,scss,ttf,woff,woff2,pannzoom}'],
    },
    manifest: {
      "name": "Pan'n'Zoom",
      "short_name": "Pan'n'Zoom",
      "start_url": ".",
      "display": "standalone",
      "background_color": "#ffffff",
      "description": "Pan'n'Zoom is a free web app, that allows you to animate panning and zooming within your images – within your browser! No account needed.",
      "icons": [
        {
          "src": "favicon_48x48.png",
          "sizes": "48x48",
          "type": "image/png"
        },
        {
          "src": "favicon_96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        },
        {
          "src": "favicon_144x144.png",
          "sizes": "144x144",
          "type": "image/png"
        },
        {
          "src": "favicon_192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    }
  })],
  resolve: {
    alias: {
      '@': url.fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  preview: {
    port: 4562
  }
})
