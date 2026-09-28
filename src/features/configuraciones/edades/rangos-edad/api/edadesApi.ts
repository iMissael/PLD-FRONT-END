import { apiClient } from "@/api/client";

import type { ActualizarEdadInput, CrearEdadInput, EdadResponse } from "../types/edad";

const BASE_PATH = "/api/catalogos/edades";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados
 * en el listado, así que no hace falta ningún parámetro de estatus.
 */
export async function listarEdades(): Promise<EdadResponse[]> {
  const { data } = await apiClient.get<EdadResponse[]>(BASE_PATH);
  return data;
}

export async function obtenerEdad(id: string): Promise<EdadResponse> {
  const { data } = await apiClient.get<EdadResponse>(`${BASE_PATH}/${id}`);
  return data;
}

export async function crearEdad(input: CrearEdadInput): Promise<EdadResponse> {
  const { data } = await apiClient.post<EdadResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarEdad(
  id: string,
  input: ActualizarEdadInput,
): Promise<EdadResponse> {
  const { data } = await apiClient.put<EdadResponse>(`${BASE_PATH}/${id}`, input);
  return data;
}

export async function eliminarEdad(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
