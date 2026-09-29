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
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    // Valor dummy para que `env.ts` valide correctamente en pruebas sin
    // depender de un .env.test (algunos entornos no permiten escribir
    // archivos .env* directamente). Sin /api ni prefijo de tenant: eso lo
    // agrega tenantInterceptor.ts en cada request.
    env: {
      VITE_API_BASE_URL: "http://localhost:8080",
    },
  },
});
