/**
 * Tipos del feature `personas` (menú: "Configuración de personas"), a partir
 * de `CatTipoAcreditadoController` en `denuncias-app`.
 *
 * Ojo con los nombres: el endpoint es `/catalogos/tipos-persona` mientras que
 * las clases del backend se llaman `CatTipoAcreditado*`. Aquí se sigue el nombre
 * del endpoint y del menú.
 */

/** A=Activo, I=Inactivo, B=Baja (borrado lógico). */
export type EstatusTipoPersona = "A" | "I" | "B";

/**
 * Igual a `CrearCatTipoAcreditadoRequest`. No lleva `id`: el backend lo genera
 * como consecutivo (`siguienteId()` en el adaptador JDBC).
 */
export interface CrearTipoPersonaInput {
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusTipoPersona;
}

/** Igual a `ActualizarCatTipoAcreditadoRequest` (mismo shape que Crear). */
export type ActualizarTipoPersonaInput = CrearTipoPersonaInput;

/** Igual a `CatTipoAcreditadoResponse`. */
export interface TipoPersonaResponse {
  id: string;
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusTipoPersona;
  createdAt: string;
  updatedAt: string;
}
