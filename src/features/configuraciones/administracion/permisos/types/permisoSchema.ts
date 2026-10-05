import { z } from "zod";
import { texto } from "@/shared/utils/validacion";

/** Mismos valores que el enum AccionPermiso del backend (minúsculas, como en el token). */
export const ACCIONES_PERMISO = [
  "ver",
  "crear",
  "modificar",
  "eliminar",
  "ejecutar",
  "desbloquear",
  "confirmar",
] as const;

export type AccionPermiso = (typeof ACCIONES_PERMISO)[number];

export const ETIQUETAS_ACCION: Record<AccionPermiso, string> = {
  ver: "Ver",
  crear: "Crear",
  modificar: "Modificar",
  eliminar: "Eliminar",
  ejecutar: "Ejecutar",
  desbloquear: "Desbloquear",
  confirmar: "Confirmar",
};

// El recurso se elige de los que protege el backend; la acción, del enum.
export const crearPermisoSchema = z.object({
  recurso: z.string().trim().min(1, "El recurso es obligatorio"),
  accion: z.enum(ACCIONES_PERMISO, {
    errorMap: () => ({ message: "La acción es obligatoria" }),
  }),
  descripcion: texto(255),
});

export type CrearPermisoFormValues = z.infer<typeof crearPermisoSchema>;
