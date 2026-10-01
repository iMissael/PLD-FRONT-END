import { z } from "zod";
import { PATRON_CURP, PATRON_RFC, conFormato } from "@/shared/utils/validacion";

/**
 * Validación del formulario de búsqueda. El nombre sí es una búsqueda difusa
 * (el backend compara por similitud de texto), pero RFC y CURP se buscan por
 * coincidencia EXACTA contra persona_bloqueada (`p.rfc = :rfc`, sin LIKE):
 * un valor con formato incorrecto nunca podría encontrar nada, así que si
 * no cumple el formato oficial se lo decimos aquí en vez de dejar que
 * "busque" en silencio y regrese cero resultados.
 */
export const busquedaBloqueadosSchema = z.object({
  nombre: z.string().trim().max(200).optional().or(z.literal("")),
  rfc: conFormato(
    13,
    PATRON_RFC,
    "RFC inválido: 3 o 4 letras, 6 dígitos de fecha y 3 de homoclave (12 o 13 caracteres)",
  ),
  curp: conFormato(18, PATRON_CURP, "CURP inválida: debe tener 18 caracteres con el formato oficial"),
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
