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
    assetsInlineLimit: 30000, // Tu configuración previa para la fuente
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Separa React y React DOM
            if (id.includes("react/") || id.includes("react-dom/")) {
              return "vendor-react";
            }
            // Separa el enrutador
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            // Separa iconos pesados si usas Lucide o similares (ajústalo si usas otra librería)
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            // Agrupa el resto de librerías de terceros
            return "vendor";
          }
        },
      },
    },
  },
});
