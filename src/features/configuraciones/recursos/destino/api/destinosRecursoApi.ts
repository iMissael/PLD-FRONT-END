import { apiClient } from "@/api/client";

import type {
  ActualizarDestinoRecursoInput,
  CrearDestinoRecursoInput,
  DestinoRecursoResponse,
} from "../types/destinoRecurso";

const BASE_PATH = "/catalogos/destinos-recurso";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados en
 * el listado, así que no hace falta ningún parámetro de estatus.
 */
export async function listarDestinosRecurso(): Promise<DestinoRecursoResponse[]> {
  const { data } = await apiClient.get<DestinoRecursoResponse[]>(BASE_PATH);
  return data;
}

export async function crearDestinoRecurso(
  input: CrearDestinoRecursoInput,
): Promise<DestinoRecursoResponse> {
  const { data } = await apiClient.post<DestinoRecursoResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarDestinoRecurso(
  id: string,
  input: ActualizarDestinoRecursoInput,
): Promise<DestinoRecursoResponse> {
  const { data } = await apiClient.put<DestinoRecursoResponse>(
    `${BASE_PATH}/${id}`,
    input,
  );
  return data;
}

export async function eliminarDestinoRecurso(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
