import { z } from "zod";
import { texto } from "@/shared/utils/validacion";

const PATRON_CLAVE_PERMISO = /^[A-Z0-9_.:-]+$/;
const MENSAJE_CLAVE_PERMISO =
  "Una sola palabra: letras, números, punto, dos puntos, guion o guion bajo";

// Los máximos son los de las columnas de la tabla permiso; el backend no los valida.
export const crearPermisoSchema = z.object({
  recurso: z
    .string()
    .trim()
    .min(1, "El recurso es obligatorio")
    .max(50, "Máximo 50 caracteres")
    .regex(PATRON_CLAVE_PERMISO, MENSAJE_CLAVE_PERMISO),
  accion: z
    .string()
    .trim()
    .min(1, "La acción es obligatoria")
    .max(50, "Máximo 50 caracteres")
    .regex(PATRON_CLAVE_PERMISO, MENSAJE_CLAVE_PERMISO),
  descripcion: texto(255),
});

export type CrearPermisoFormValues = z.infer<typeof crearPermisoSchema>;
