import baseConfig from "./vite.config.base";
import { defineConfig, mergeConfig } from "vite";
import { resolve } from "path";

export default mergeConfig(baseConfig, defineConfig({
  build: {
    rollupOptions: {
      input: resolve(__dirname, "extension/background.ts"),
      output: {
        entryFileNames: "background.js",
        format: "iife",
        inlineDynamicImports: true,
      },
    },
  },
}));