/**
 * Tipos del feature `personas` (menú: "Configuración de personas"), a partir
 * de `CatTipoSocioController` en `denuncias-app`.
 *
 * Ojo con los nombres: el endpoint es `/catalogos/tipos-persona` mientras que
 * las clases del backend se llaman `CatTipoSocio*`. Aquí se sigue el nombre
 * del endpoint y del menú.
 */

/**
 * Valores del enum `Estatus` del backend: A=Activa, B=Baja, S=Suspendido,
 * E=Eliminado. El formulario solo ofrece A y B — `E` lo escribe el
 * soft-delete del backend y `S` no se usa en este catálogo.
 */
export type EstatusTipoPersona = "A" | "B" | "S" | "E";

/**
 * Igual a `CrearCatTipoSocioRequest`. No lleva `id`: el backend lo genera
 * como consecutivo (`siguienteId()` en el adaptador JDBC).
 */
export interface CrearTipoPersonaInput {
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusTipoPersona;
}

/** Igual a `ActualizarCatTipoSocioRequest` (mismo shape que Crear). */
export type ActualizarTipoPersonaInput = CrearTipoPersonaInput;

/** Igual a `CatTipoSocioResponse`. */
export interface TipoPersonaResponse {
  id: string;
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusTipoPersona;
  createdAt: string;
  updatedAt: string;
}
