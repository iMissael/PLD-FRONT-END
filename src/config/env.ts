import { z } from "zod";

/**
 * Variables de entorno del front, validadas al arrancar la app.
 * Si falta o es inválida alguna, la app falla rápido con un mensaje claro
 * en vez de fallar silenciosamente en el primer request.
 *
 * `VITE_API_BASE_URL` es SOLO protocolo+host(+puerto) del backend, sin
 * `/api` ni el prefijo de tenant: ambos los agrega `tenantInterceptor.ts`
 * en cada request, porque el prefijo depende del tenant de la URL
 * (`/SICANETSC/PLD/{tenantId}`), no es un valor fijo de configuración.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url({
    message: "VITE_API_BASE_URL debe ser una URL válida, ej: http://localhost:8080",
  }),
  VITE_API_DOCS_URL: z.string().url().optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Configuración de entorno inválida. Revisa tu archivo .env.local:\n${details}`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();
