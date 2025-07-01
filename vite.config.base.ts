import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// Shared Vite config for all extension targets
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    minify: false,
    sourcemap: false,
  },
});
