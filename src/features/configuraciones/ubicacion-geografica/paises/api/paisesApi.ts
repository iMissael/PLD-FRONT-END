import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type { ActualizarPaisInput, CrearPaisInput, PaisResponse } from "../types/pais";

const BASE_PATH = "/catalogos/paises";

// El endpoint pagina (cat_pais tiene ~192 filas): se traen todas las páginas
// porque esta tabla todavía no tiene controles de paginación propios.
export async function listarPaises(params?: {
  busqueda?: string;
  filtrarPor?: string;
}): Promise<PaisResponse[]> {
  return listarCatalogoCompleto<PaisResponse>(BASE_PATH, params);
}

export async function obtenerPais(id: string): Promise<PaisResponse> {
  const { data } = await apiClient.get<PaisResponse>(`${BASE_PATH}/${id}`);
  return data;
}

export async function crearPais(input: CrearPaisInput): Promise<PaisResponse> {
  const { data } = await apiClient.post<PaisResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarPais(
  id: string,
  input: ActualizarPaisInput,
): Promise<PaisResponse> {
  const { data } = await apiClient.put<PaisResponse>(`${BASE_PATH}/${id}`, input);
  return data;
}

export async function asignarZonasAPais(id: string, zonaIds: string[]): Promise<void> {
  await apiClient.put(`${BASE_PATH}/${id}/zonas`, { zonaIds });
}

/**
 * IDs reales de las zonas de un país. `PaisResponse.zonasAsignadas` puede
 * traer solo etiquetas para mostrar en la tabla; para precargar el
 * multi-select de edición se usa este endpoint dedicado, que el backend
 * documenta explícitamente como una lista de IDs.
 */
export async function obtenerZonaIdsDePais(id: string): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`${BASE_PATH}/${id}/zonas`);
  return data;
}

export async function eliminarPais(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
