/**
 * Tipos del feature `entidades`, a partir de `EntidadGeograficaController` /
 * sus DTOs en `denuncias-app`. Todas las entidades de este catálogo son de
 * México, así que el front resuelve `paisId` automáticamente buscando
 * "México" en el catálogo de países (nunca como un ID literal fijo) y no
 * muestra un selector de país en el formulario.
 *
 * `claveInegi` ya no existe en la tabla: la reemplaza `claveCurp`. `id` pasa
 * de numérico a un consecutivo de texto (VARCHAR(10)), igual que País y
 * Zona.
 */

/** 'S' = es una entidad federativa, 'N' = no lo es (p. ej. un país-entidad especial). */
export type EsEntidad = "S" | "N";

/** Igual a `CrearCatEntidadGeograficaRequest`. */
export interface CrearEntidadInput {
  claveCurp: string;
  nombre: string;
  /** Código corto opcional, máx. 4 caracteres. */
  preBuro?: string;
  esEntidad?: EsEntidad;
  paisId: string;
  zonaId: string;
  zonaIds?: string[];
}

/** Igual a `ActualizarCatEntidadGeograficaRequest` (mismo shape que Crear). */
export type ActualizarEntidadInput = CrearEntidadInput;

/**
 * Igual a `EntidadCatGeograficaResponse`. Los campos de zona van nulos si la
 * entidad no tiene zona asignada, y `claveZona` espeja `idZona` (no es un dato
 * propio). La relación es muchos a muchos: `zonasAsignadas` trae todas, pero
 * `idZona`/`nombreZona`/`nivelRiesgo*` describen solo la primera que devuelve
 * la consulta, así que con varias zonas cuál se expone es arbitrario.
 */
export interface EntidadResponse {
  idEntidad: string;
  claveCurp: string;
  nombre: string;
  preBuro: string;
  esEntidad: EsEntidad;
  idPais: string;
  nombrePais: string;
  idZona?: string;
  nombreZona?: string;
  claveZona?: string;
  nivelRiesgoValor?: number;
  nivelRiesgoDescripcion?: string;
  zonasAsignadas?: string[];
}
