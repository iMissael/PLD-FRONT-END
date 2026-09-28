import { apiClient } from "@/api/client";

import type {
  ActualizarEntidadInput,
  CrearEntidadInput,
  EntidadResponse,
} from "../types/entidad";

const BASE_PATH = "/api/catalogos/entidades";

export async function listarEntidades(params?: {
  busqueda?: string;
  filtrarPor?: string;
  idZona?: string;
}): Promise<EntidadResponse[]> {
  const { data } = await apiClient.get<EntidadResponse[]>(BASE_PATH, { params });
  return data;
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

export async function eliminarEntidad(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
