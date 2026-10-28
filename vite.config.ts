import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 4000,
    // Two pages: the playground and the before/after comparison.
    rollupOptions: { input: { main: "index.html", compare: "compare/index.html" } },
  },
});
