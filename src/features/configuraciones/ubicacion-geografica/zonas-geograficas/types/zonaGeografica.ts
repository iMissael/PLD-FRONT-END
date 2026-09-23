/**
 * Tipos del feature `zonas-geograficas`, a partir de los DTOs reales de
 * `ZonaRiesgoGeograficoController` (`denuncias-app`).
 */

/**
 * OJO: el enum `Estatus` del dominio nunca se compartió con su código
 * fuente. "A"/"INA" se infieren únicamente de la descripción Swagger del
 * parámetro `estatus` en `listarZonas` ("Filtro por estatus (A/INA)") —
 * es una suposición razonable, no un valor confirmado. El tipo acepta
 * cualquier string para no romper si el backend usa otro valor.
 */
export type EstatusZona = "A" | "INA" | (string & {});

/** 'E' = zona de entidades (estados/regiones de México), 'P' = zona de países. */
export type EntidadPais = "E" | "P";

/** Igual a `CrearCatZonaRiesgoRequest`. */
export interface CrearZonaGeograficaInput {
  nombre: string;
  idNivelRiesgo: number;
  entidadPais: EntidadPais;
  estatus: EstatusZona;
}

/** Igual a `ActualizarCatZonaRiesgoRequest` (mismo shape que Crear). */
export type ActualizarZonaGeograficaInput = CrearZonaGeograficaInput;

/** Igual a `CatZonaRiesgoResponse`. */
export interface ZonaGeograficaResponse {
  id: string;
  nombre: string;
  nivelRiesgoId: number;
  /** Puede venir null en zonas antiguas creadas antes de este campo. */
  entidadPais: EntidadPais | null;
  estatus: EstatusZona;
  nivelRiesgoValor: number;
  nivelRiesgoDescripcion: string;
  totalEntidadesAsignadas: number;
  totalPaisesAsignados: number;
}

/** Igual a `EntidadCatAsignadaResponse` (resumen de entidad asignada a una zona). */
export interface EntidadAsignadaResponse {
  id: string;
  claveCurp: string;
  nombre: string;
}

/** Igual a `PaisAsignadoResponse` (resumen de país asignado a una zona). */
export interface PaisAsignadoResponse {
  id: string;
  codigoIso: string;
  nombre: string;
  zonaId: string;
  claveZona: string;
  nombreZona: string;
  nivelRiesgoValor: number;
  nivelRiesgoDescripcion: string;
}
