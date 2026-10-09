/**
 * Tipos del feature `zonas-geograficas` (zonas de riesgo de entidades), igual a
 * los DTOs de `ZonaRiesgoGeograficoController`. Los países no van aquí: se
 * clasifican en listas de riesgo (feature `listas-paises`).
 *
 * Las tres zonas principales (ZONA 1, 2 y 3 - NACIONAL) son fijas: solo se
 * cambia su nivel. Cada entidad está en una sola. Las zonas especiales (p. ej.
 * ZONA FRONTERIZA) agrupan entidades de distintas zonas principales y no tienen
 * nivel: cada entidad conserva el de su zona principal.
 */

/** A = activa, B = baja. */
export type EstatusZona = "A" | "B" | (string & {});

/** Igual a `CrearCatZonaRiesgoRequest`. */
export interface CrearZonaGeograficaInput {
  nombre: string;
  /** Solo en zonas principales; una especial no tiene nivel. */
  idNivelRiesgo: number | null;
  /** Agrupa entidades especiales en vez de paises. Columna NOT NULL en la base. */
  esEntidadEspecial: boolean;
  estatus: EstatusZona;
}

/** Igual a `ActualizarCatZonaRiesgoRequest` (mismo shape que Crear). */
export type ActualizarZonaGeograficaInput = CrearZonaGeograficaInput;

/** Igual a `CatZonaRiesgoResponse`. */
export interface ZonaGeograficaResponse {
  id: string;
  nombre: string;
  /** null en una zona especial. */
  nivelRiesgoId: number | null;
  esEntidadEspecial: boolean;
  estatus: EstatusZona;
  nivelRiesgoValor: number | null;
  nivelRiesgoDescripcion: string | null;
  totalEntidadesAsignadas: number;
}

/** Igual a `EntidadCatAsignadaResponse` (resumen de entidad asignada a una zona). */
export interface EntidadAsignadaResponse {
  id: string;
  claveCurp: string;
  nombre: string;
}
