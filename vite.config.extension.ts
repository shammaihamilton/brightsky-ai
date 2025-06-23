import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'extension/manifest.json',
          dest: '.'
        },
        {
          src: 'extension/popup.html',
          dest: '.'
        },
        {
          src: 'src/index.css', // Copy built Tailwind CSS
          dest: '.'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'extension/src/content/index.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'iife',
      },
    },
    minify: false, // Easier debugging
    sourcemap: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
