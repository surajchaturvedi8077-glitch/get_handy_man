/**
 * vite.config.js
 * ------------------------------------------------------------------
 * Dev server proxies /api and /uploads to the backend so the frontend
 * can call relative paths (no CORS juggling) during local development.
 * VITE_API_URL in .env overrides the base URL for production builds
 * — see src/api/axiosClient.js.
 * ------------------------------------------------------------------
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
