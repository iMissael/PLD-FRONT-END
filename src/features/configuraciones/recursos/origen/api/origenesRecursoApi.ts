import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type {
  ActualizarOrigenRecursoInput,
  CrearOrigenRecursoInput,
  OrigenRecursoResponse,
} from "../types/origenRecurso";

const BASE_PATH = "/catalogos/origenes-recurso";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados en
 * el listado, así que no hace falta ningún parámetro de estatus. El endpoint
 * pagina: se traen todas las páginas porque esta tabla todavía no tiene
 * controles de paginación propios.
 */
export async function listarOrigenesRecurso(): Promise<OrigenRecursoResponse[]> {
  return listarCatalogoCompleto<OrigenRecursoResponse>(BASE_PATH);
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
