import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/cms_new': {
        target: 'https://admission.dei.ac.in:8085',
        changeOrigin: true,
        secure: false,
      },
      '/CMS': {
        target: 'https://admission.dei.ac.in:8085',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
