import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import url from "url"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': url.fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
