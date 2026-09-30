import { apiClient } from "@/api/client";

import type {
  ActualizarOrigenRecursoInput,
  CrearOrigenRecursoInput,
  OrigenRecursoResponse,
} from "../types/origenRecurso";

const BASE_PATH = "/catalogos/origenes-recurso";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados en
 * el listado, así que no hace falta ningún parámetro de estatus.
 */
export async function listarOrigenesRecurso(): Promise<OrigenRecursoResponse[]> {
  const { data } = await apiClient.get<OrigenRecursoResponse[]>(BASE_PATH);
  return data;
}

export async function crearOrigenRecurso(
  input: CrearOrigenRecursoInput,
): Promise<OrigenRecursoResponse> {
  const { data } = await apiClient.post<OrigenRecursoResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarOrigenRecurso(
  id: string,
  input: ActualizarOrigenRecursoInput,
): Promise<OrigenRecursoResponse> {
  const { data } = await apiClient.put<OrigenRecursoResponse>(
    `${BASE_PATH}/${id}`,
    input,
  );
  return data;
}

export async function eliminarOrigenRecurso(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
