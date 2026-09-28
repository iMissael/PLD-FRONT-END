import { z } from "zod";
import { texto } from "@/shared/utils/validacion";

const PATRON_NOMBRE_ROL = /^[A-ZÑ0-9 _-]+$/;
const MENSAJE_NOMBRE_ROL = "Solo letras, números, espacio, guion o guion bajo";

// Los máximos son los de las columnas de la tabla rol; el backend no los valida.
export const crearRolSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(50, "Máximo 50 caracteres")
    .regex(PATRON_NOMBRE_ROL, MENSAJE_NOMBRE_ROL),
  categoria: z
    .string()
    .trim()
    .min(1, "La categoría es obligatoria")
    .max(50, "Máximo 50 caracteres")
    .regex(PATRON_NOMBRE_ROL, MENSAJE_NOMBRE_ROL),
  descripcion: texto(255),
});

export type CrearRolFormValues = z.infer<typeof crearRolSchema>;
