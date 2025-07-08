import baseConfig from "./vite.config.base";
import { defineConfig, mergeConfig } from "vite";
import { resolve } from "path";

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      rollupOptions: {
        // input: resolve(__dirname, "src/components/popupTabbed/index.tsx"),
        input: resolve(__dirname, "src/components/popup/index.tsx"),
        output: {
          entryFileNames: "popup.js",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            // Prefer assetInfo.name if available (most common)
            if (assetInfo.name && assetInfo.name.endsWith(".css"))
              return "popup.css";
            // Fallback for some plugin versions that provide 'names' array
            if (
              assetInfo.names &&
              assetInfo.names.some((n) => n.endsWith(".css"))
            )
              return "popup.css";
            return "assets/[name].[ext]";
          },
          format: "es",
          inlineDynamicImports: true,
        },
      },
    },
  })
);
