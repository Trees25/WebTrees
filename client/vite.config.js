import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    assetsInlineLimit: 30000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Agrupa TODAS las dependencias en un solo archivo "vendor".
            // Esto reduce las peticiones HTTP a la mitad en comparación con la configuración anterior.
            return "vendor";
          }
        },
      },
    },
  },
});
