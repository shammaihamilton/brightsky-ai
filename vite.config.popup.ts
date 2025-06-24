import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't clear the dist folder
    rollupOptions: {
      input: resolve(__dirname, 'src/popup/index.tsx'),
      output: {
        entryFileNames: 'popup.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
        format: 'es',
      },
    },
    minify: false,
    sourcemap: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
