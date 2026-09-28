/**
 * Tipos del feature `experiencia-actividad` (menú: "Configuración de
 * experiencia de actividad"), a partir de `CatExperienciaActividadController`
 * en `denuncias-app`.
 */

/**
 * Valores del enum `Estatus` del backend: A=Activa, B=Baja, S=Suspendido,
 * E=Eliminado. El formulario solo ofrece A y B — `E` lo escribe el
 * soft-delete del backend y `S` no se usa en este catálogo.
 */
export type EstatusExperienciaActividad = "A" | "B" | "S" | "E";

/**
 * Igual a `CrearCatExperienciaActividadRequest`.
 *
 * - `id` no se envía: el backend lo genera como consecutivo. Se le quitó el
 *   `@NotBlank` para que esta pantalla no tenga que pedir una clave a mano.
 * - `nombre` no lo captura el usuario: se deriva del rango (ver
 *   `utils/nombreExperiencia.ts`), pero sí viaja al backend porque la columna
 *   es NOT NULL.
 * - `aniosMax` en `null` significa rango abierto ("10 años o más").
 */
export interface CrearExperienciaActividadInput {
  nombre: string;
  aniosMin: number;
  aniosMax: number | null;
  catNivelRiesgoId: number;
  estatus: EstatusExperienciaActividad;
}

/** Igual a `ActualizarCatExperienciaActividadRequest` (mismo shape que Crear). */
export type ActualizarExperienciaActividadInput = CrearExperienciaActividadInput;

/** Igual a `CatExperienciaActividadResponse`. */
export interface ExperienciaActividadResponse {
  id: string;
  nombre: string;
  aniosMin: number;
  /** null = rango abierto ("N años o más"). */
  aniosMax: number | null;
  catNivelRiesgoId: number;
  estatus: EstatusExperienciaActividad;
  createdAt: string;
  updatedAt: string;
}
