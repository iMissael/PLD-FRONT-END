import { z } from "zod";

/**
 * Validación del formulario de búsqueda. Es deliberadamente mínima: el
 * front solo evita requests inútiles (todo vacío) y normaliza mayúsculas
 * en RFC/CURP. No valida el formato exacto de RFC/CURP con regex: esa es
 * una regla de negocio y vive en el backend.
 */
export const busquedaBloqueadosSchema = z.object({
  nombre: z.string().trim().max(200).optional().or(z.literal("")),
  rfc: z
    .string()
    .trim()
    .max(13)
    .transform((value) => value.toUpperCase())
    .optional()
    .or(z.literal("")),
  curp: z
    .string()
    .trim()
    .max(18)
    .transform((value) => value.toUpperCase())
    .optional()
    .or(z.literal("")),
  fechaNacimiento: z.string().optional().or(z.literal("")),
});

export type BusquedaBloqueadosFormValues = z.infer<typeof busquedaBloqueadosSchema>;

/**
 * "Al menos un criterio" se valida aparte del schema de campos (en el
 * componente, en el submit) para no pelear con el tipado de errores a
 * nivel de formulario de RHF; aquí solo queda el helper compartido.
 */
export function tieneAlMenosUnCriterio(values: BusquedaBloqueadosFormValues): boolean {
  return Object.values(values).some(
    (value) => typeof value === "string" && value.length > 0,
  );
}
