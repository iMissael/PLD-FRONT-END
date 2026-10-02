import { z } from "zod";

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
