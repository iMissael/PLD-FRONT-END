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
}

/** Igual a `ActualizarCatEntidadGeograficaRequest` (mismo shape que Crear). */
export type ActualizarEntidadInput = CrearEntidadInput;

/**
 * Igual a `EntidadCatGeograficaResponse`. OJO: `claveZona` está hardcoded a
 * `""` en el mapper actual del backend (comentario fuente: "claveZona not
 * found") — nunca confiar en que traiga un valor real.
 */
export interface EntidadResponse {
  idEntidad: string;
  claveCurp: string;
  nombre: string;
  preBuro: string;
  esEntidad: EsEntidad;
  idPais: string;
  nombrePais: string;
  idZona: string;
  nombreZona: string;
  claveZona: string;
  nivelRiesgoValor: number;
  nivelRiesgoDescripcion: string;
}
