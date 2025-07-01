import baseConfig from "./vite.config.base";
import { defineConfig, mergeConfig } from "vite";
import { resolve } from "path";

export default mergeConfig(baseConfig, defineConfig({
  build: {
    rollupOptions: {
      input: resolve(__dirname, "extension/src/content/index.tsx"),
      output: {
        entryFileNames: "content.js",
        format: "iife",
        inlineDynamicImports: true,
      },
    },
  },
}));