import { apiClient } from "@/api/client";

import type {
  CambiarNivelRiesgoLocalidadInput,
  LocalidadResponse,
  PaginaResponse,
} from "../types/localidad";

const BASE_PATH = "/catalogos/localidades";

export interface ListarLocalidadesParams {
  /** Aplica SOLO al nombre de la localidad; municipio y entidad van aparte. */
  busqueda?: string;
  filtrarPor?: string;
  idMunicipio?: string;
  /** Filtra por entidad federativa, resuelto en el backend vía el municipio. */
  idEntidad?: string;
  idNivelRiesgo?: number;
  /** Índice base 0. */
  pagina?: number;
  /** Filas por página; el backend lo acota a 200 como máximo. */
  tamanio?: number;
}

/**
 * Listado paginado. El backend devuelve `PaginaResponse`, no un arreglo
 * plano: la tabla tiene ~296 mil filas activas y antes el adaptador las
 * truncaba con un `LIMIT 500` silencioso.
 */
export async function listarLocalidades(
  params?: ListarLocalidadesParams,
): Promise<PaginaResponse<LocalidadResponse>> {
  const { data } = await apiClient.get<PaginaResponse<LocalidadResponse>>(BASE_PATH, {
    params,
  });
  return data;
}

export async function cambiarNivelRiesgoLocalidad(
  id: string,
  input: CambiarNivelRiesgoLocalidadInput,
): Promise<LocalidadResponse> {
  const { data } = await apiClient.put<LocalidadResponse>(
    `${BASE_PATH}/${id}/nivel-riesgo`,
    input,
  );
  return data;
}
