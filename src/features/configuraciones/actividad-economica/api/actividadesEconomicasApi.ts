import { apiClient } from "@/api/client";

import type {
  ActualizarActividadEconomicaInput,
  ActividadEconomicaResponse,
  CrearActividadEconomicaInput,
} from "../types/actividadEconomica";

const BASE_PATH = "/catalogos/actividades-economicas";

/**
 * Devuelve el catálogo completo (~1,261 registros): el backend no acepta
 * parámetros de búsqueda ni de página. La búsqueda y la paginación viven en
 * el cliente; si este catálogo creciera mucho habría que agregar `busqueda`
 * al controller, como ya lo tiene `PaisController`.
 */
export async function listarActividadesEconomicas(): Promise<
  ActividadEconomicaResponse[]
> {
  const { data } = await apiClient.get<ActividadEconomicaResponse[]>(BASE_PATH);
  return data;
}

export async function obtenerActividadEconomica(
  id: string,
): Promise<ActividadEconomicaResponse> {
  const { data } = await apiClient.get<ActividadEconomicaResponse>(`${BASE_PATH}/${id}`);
  return data;
}

/** Un `claveSat` repetido responde 409 con el mensaje del backend. */
export async function crearActividadEconomica(
  input: CrearActividadEconomicaInput,
): Promise<ActividadEconomicaResponse> {
  const { data } = await apiClient.post<ActividadEconomicaResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarActividadEconomica(
  id: string,
  input: ActualizarActividadEconomicaInput,
): Promise<ActividadEconomicaResponse> {
  const { data } = await apiClient.put<ActividadEconomicaResponse>(
    `${BASE_PATH}/${id}`,
    input,
  );
  return data;
}

export async function eliminarActividadEconomica(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
