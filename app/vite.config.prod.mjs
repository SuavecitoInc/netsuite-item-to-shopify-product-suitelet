import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), tailwindcss(), cssInjectedByJsPlugin()],
  build: {
    rollupOptions: {
      input: {
        app: './src/index.tsx',
      },
      output: {
        dir: 'dist',
        entryFileNames: 'shopify-product-bundle.js',
        chunkFileNames: 'shopify-product-bundle.js',
        manualChunks: undefined,
      },
    },
  },
});
