/**
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

export interface ListaPaisResponse {
  id: string;
  nombre: string;
  nivelRiesgoId: number;
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
}
