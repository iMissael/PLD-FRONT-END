import { apiClient } from "@/api/client";

import type {
  ActualizarTiempoConstitucionInput,
  CrearTiempoConstitucionInput,
  TiempoConstitucionResponse,
} from "../types/tiempoConstitucion";

const BASE_PATH = "/catalogos/tiempos-constitucion";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados
 * en el listado, así que no hace falta ningún parámetro de estatus.
 */
export async function listarTiemposConstitucion(): Promise<
  TiempoConstitucionResponse[]
> {
  const { data } = await apiClient.get<TiempoConstitucionResponse[]>(BASE_PATH);
  return data;
}

export async function obtenerTiempoConstitucion(
  id: string,
): Promise<TiempoConstitucionResponse> {
  const { data } = await apiClient.get<TiempoConstitucionResponse>(`${BASE_PATH}/${id}`);
  return data;
}

export async function crearTiempoConstitucion(
  input: CrearTiempoConstitucionInput,
): Promise<TiempoConstitucionResponse> {
  const { data } = await apiClient.post<TiempoConstitucionResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarTiempoConstitucion(
  id: string,
  input: ActualizarTiempoConstitucionInput,
): Promise<TiempoConstitucionResponse> {
  const { data } = await apiClient.put<TiempoConstitucionResponse>(
    `${BASE_PATH}/${id}`,
    input,
  );
  return data;
}

export async function eliminarTiempoConstitucion(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
