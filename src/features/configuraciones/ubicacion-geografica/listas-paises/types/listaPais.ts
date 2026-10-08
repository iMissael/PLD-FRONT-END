/**
 * Tipos del feature `listas-paises`, basados en OpenAPI Swagger (Catálogos - Geografía: Listas de Países).
 */

export type EstatusListaPais = "A" | "INA" | "B" | "S" | "E" | (string & {});

/** Igual a `CrearCatListaPaisRequest`. */
export interface CrearListaPaisInput {
  nombre: string;
  idNivelRiesgo: number;
  estatus: EstatusListaPais;
}

/** Igual a `ActualizarCatListaPaisRequest`. */
export type ActualizarListaPaisInput = CrearListaPaisInput;

/** Igual a `CatListaPaisResponse`. */
export interface ListaPaisResponse {
  id: string;
  nombre: string;
  nivelRiesgoId: number;
  estatus: EstatusListaPais;
  nivelRiesgoValor: number;
  nivelRiesgoDescripcion: string;
  totalPaisesAsignados: number;
}

/** Igual a `PaisAsignadoResponse`. */
export interface PaisAsignadoResponse {
  id: string;
  codigoIso?: string;
  nombre: string;
  zonaId?: string;
  claveZona?: string;
  nombreZona?: string;
  nivelRiesgoValor?: number;
  nivelRiesgoDescripcion?: string;
}
