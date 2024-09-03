import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  // Your specific Vite configuration options here
  base: "/wwwroot/",
  build: {
    target: "es2020",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/main.ts"), // Main entry point
        main: path.resolve(__dirname, "src/common/index.ts"),
        main: path.resolve(__dirname, "src/view/main/index.ts"),
        main: path.resolve(__dirname, "src/view/main/components/index.ts"),
        main: path.resolve(__dirname, "src/view/top-nav/index.ts"),
        main: path.resolve(__dirname, "src/view/top-nav/pages/index.ts"),
      },
      output: {
        // Control the naming convention for chunks, entry files, and assets
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
        manualChunks(id) {
          // Handle chunks for components
          if (id.includes("src/view/main/components")) {
            return "components"; // This will bundle all components into a single chunk
          }
          if (id.includes("src/view/topnav")) {
            return "topnav"; // This will bundle all top navigation components into another chunk
          }
          // Node modules can be bundled separately for better caching
          if (id.includes("node_modules")) {
            return "vendor"; // Bundles all libraries and third-party modules
          }
        },
      },
    },
  },
});
