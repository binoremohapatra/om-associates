import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  assetsInclude: ['**/*.glb'],
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    // Increase warning threshold — Three.js chunks are expected to be large
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion/') || id.includes('node_modules/motion/')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/recharts/')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/clsx/') || id.includes('node_modules/tailwind-merge/') || id.includes('node_modules/lucide-react/')) {
            return 'vendor-ui';
          }
        },
      },
    },
  },
});
