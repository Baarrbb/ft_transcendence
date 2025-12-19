import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [tailwindcss(),],
   resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared')
    }
  },
//   build: {
//     outDir: "./dist", // Dossier de sortie
//   },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
	  '/uploads': {
		target: 'http://backend:3001',
		changeOrigin: true
	  }
    }
  },
});
