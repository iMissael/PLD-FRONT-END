import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type {
  ActualizarActividadEconomicaInput,
  ActividadEconomicaResponse,
  CrearActividadEconomicaInput,
} from "../types/actividadEconomica";

const BASE_PATH = "/catalogos/actividades-economicas";

/**
 * Devuelve el catálogo completo (~1,261 registros). El endpoint ahora pagina
 * (máx. 50 filas por página): se traen todas las páginas en paralelo y se
 * aplanan, porque esta tabla todavía no tiene controles de paginación propios.
 */
export async function listarActividadesEconomicas(): Promise<
  ActividadEconomicaResponse[]
> {
  return listarCatalogoCompleto<ActividadEconomicaResponse>(BASE_PATH);
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
