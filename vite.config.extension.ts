import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "extension/manifest.json",
          dest: ".",
        },
        {
          src: "extension/popup.html",
          dest: ".",
        },
        {
          src: "extension/background.js",
          dest: ".",
        },
        {
          src: "src/popup/styles/popup.css",
          dest: ".",
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: resolve(__dirname, "extension/src/content/index.tsx"),
      output: {
        entryFileNames: "content.js",
        chunkFileNames: "content.js",
        assetFileNames: "[name].[ext]",
        format: "iife",
        inlineDynamicImports: true,
      },
    },
    minify: false, // Easier debugging
    sourcemap: false,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
