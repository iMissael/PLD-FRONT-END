import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "^/SICANETSC/.*": {
        target: "http://localhost:8080",
        changeOrigin: true,
        bypass(req) {
          // Si es navegación del navegador (solicita HTML), servir index.html del front (React Router)
          // en lugar de enviar la petición de página al backend Spring Boot.
          if (req.headers.accept?.includes("text/html")) {
            return "/index.html";
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    env: {
      VITE_API_BASE_URL: "http://localhost:8080",
    },
  },
});
