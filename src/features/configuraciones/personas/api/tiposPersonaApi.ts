import { apiClient } from "@/api/client";

import type {
  ActualizarTipoPersonaInput,
  CrearTipoPersonaInput,
  TipoPersonaResponse,
} from "../types/tipoPersona";

const BASE_PATH = "/api/catalogos/tipos-persona";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados
 * en el listado, así que aquí no hace falta ningún parámetro de estatus.
 */
export async function listarTiposPersona(): Promise<TipoPersonaResponse[]> {
  const { data } = await apiClient.get<TipoPersonaResponse[]>(BASE_PATH);
  return data;
}

export async function obtenerTipoPersona(id: string): Promise<TipoPersonaResponse> {
  const { data } = await apiClient.get<TipoPersonaResponse>(`${BASE_PATH}/${id}`);
  return data;
}

export async function crearTipoPersona(
  input: CrearTipoPersonaInput,
): Promise<TipoPersonaResponse> {
  const { data } = await apiClient.post<TipoPersonaResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarTipoPersona(
  id: string,
  input: ActualizarTipoPersonaInput,
): Promise<TipoPersonaResponse> {
  const { data } = await apiClient.put<TipoPersonaResponse>(`${BASE_PATH}/${id}`, input);
  return data;
}

export async function eliminarTipoPersona(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
