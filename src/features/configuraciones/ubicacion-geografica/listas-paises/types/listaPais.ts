/**
<<<<<<< HEAD
 * Listas de riesgo de países (PAÍS COOPERANTE, PAIS NO COOPERANTE (GAFI),
 * PARAISOS FISCALES DEL SAT...), igual a los DTOs de `ListaPaisRiesgoController`.
 * Un país puede estar en varias listas; para la matriz cuenta la de nivel más alto.
 */

/** A = activa, B = baja. */
export type EstatusLista = "A" | "B" | (string & {});

export interface ListaPaisInput {
  nombre: string;
  idNivelRiesgo: number;
  estatus: EstatusLista;
}

=======
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
>>>>>>> origin/develop
export interface ListaPaisResponse {
  id: string;
  nombre: string;
  nivelRiesgoId: number;
<<<<<<< HEAD
  estatus: EstatusLista;
  nivelRiesgoValor: number | null;
  nivelRiesgoDescripcion: string | null;
  totalPaisesAsignados: number;
}

/** País dentro de una lista. */
export interface PaisEnListaResponse {
  id: string;
  codigoIso: string | null;
  nombre: string;
  listaId: string | null;
  nombreLista: string | null;
  nivelRiesgoValor: number | null;
  nivelRiesgoDescripcion: string | null;
=======
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
>>>>>>> origin/develop
}
