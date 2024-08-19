import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      // @ts-ignore - This is a hack to allow us to import from the root
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/dev': {
        target: 'https://devauth.cartibuy.sa/api/v2',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/dev/, ''),
        ws: true,
      },
    },
  },
});
