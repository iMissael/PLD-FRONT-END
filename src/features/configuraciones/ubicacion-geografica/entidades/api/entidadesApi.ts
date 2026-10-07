import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type {
  ActualizarEntidadInput,
  CrearEntidadInput,
  EntidadResponse,
} from "../types/entidad";

const BASE_PATH = "/catalogos/entidades";

// El endpoint pagina: se traen todas las páginas porque esta tabla todavía no
// tiene controles de paginación propios.
export async function listarEntidades(params?: {
  busqueda?: string;
  filtrarPor?: string;
  idZona?: string;
}): Promise<EntidadResponse[]> {
  return listarCatalogoCompleto<EntidadResponse>(BASE_PATH, params);
}

export async function obtenerEntidad(id: string): Promise<EntidadResponse> {
  const { data } = await apiClient.get<EntidadResponse>(`${BASE_PATH}/${id}`);
  return data;
}

export async function crearEntidad(input: CrearEntidadInput): Promise<EntidadResponse> {
  const { data } = await apiClient.post<EntidadResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarEntidad(
  id: string,
  input: ActualizarEntidadInput,
): Promise<EntidadResponse> {
  const { data } = await apiClient.put<EntidadResponse>(`${BASE_PATH}/${id}`, input);
  return data;
}

/** Endpoint ligero para el flujo rápido de "reasignar solo la zona" de una entidad. */
export async function asignarZonaAEntidad(
  id: string,
  zonaId: string,
): Promise<EntidadResponse> {
  const { data } = await apiClient.put<EntidadResponse>(`${BASE_PATH}/${id}/zona`, {
    zonaId,
  });
  return data;
}

/** Ids de todas las zonas de la entidad (la principal y las especiales). */
export async function obtenerZonaIdsDeEntidad(id: string): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`${BASE_PATH}/${id}/zonas`);
  return data;
}

export async function eliminarEntidad(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
