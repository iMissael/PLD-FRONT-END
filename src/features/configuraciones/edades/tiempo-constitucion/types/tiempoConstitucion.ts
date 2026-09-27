/**
 * Tipos del feature `tiempo-constitucion` (menú: "Configuración de edades" ›
 * "Tiempo de constitución"), a partir de `CatTiempoConstitucionController` en
 * `denuncias-app`.
 */

/**
 * Valores del enum `Estatus` del backend: A=Activa, B=Baja, S=Suspendido,
 * E=Eliminado. El formulario solo ofrece A y B — `E` lo escribe el
 * soft-delete del backend y `S` no se usa en este catálogo.
 */
export type EstatusTiempoConstitucion = "A" | "B" | "S" | "E";

/**
 * Igual a `CrearCatTiempoConstitucionRequest`.
 *
 * - `id` no se envía: el backend lo genera como consecutivo. Se le quitó el
 *   `@NotBlank` para que esta pantalla no tenga que pedir una clave a mano.
 * - `nombre` no lo captura el usuario: se deriva del rango (ver
 *   `utils/nombreRango.ts`), pero sí viaja al backend porque la columna es
 *   NOT NULL.
 * - `aniosMax` en `null` significa rango abierto ("10 años o más"). La columna
 *   es nullable y el Request no lo exige.
 */
export interface CrearTiempoConstitucionInput {
  nombre: string;
  aniosMin: number;
  aniosMax: number | null;
  catNivelRiesgoId: number;
  estatus: EstatusTiempoConstitucion;
}

/** Igual a `ActualizarCatTiempoConstitucionRequest` (mismo shape que Crear). */
export type ActualizarTiempoConstitucionInput = CrearTiempoConstitucionInput;

/** Igual a `CatTiempoConstitucionResponse`. */
export interface TiempoConstitucionResponse {
  id: string;
  nombre: string;
  aniosMin: number;
  /** null = rango abierto ("N años o más"). */
  aniosMax: number | null;
  catNivelRiesgoId: number;
  estatus: EstatusTiempoConstitucion;
  createdAt: string;
  updatedAt: string;
}
