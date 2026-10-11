import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type { ActualizarPepInput, CrearPepInput, PepResponse } from "../types/pep";

const BASE_PATH = "/catalogos/peps";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados en
 * el listado, así que aquí no hace falta ningún parámetro de estatus. El
 * endpoint pagina: se traen todas las páginas porque esta tabla no tiene
 * controles de paginación de servidor.
 */
export async function listarPeps(): Promise<PepResponse[]> {
  return listarCatalogoCompleto<PepResponse>(BASE_PATH);
}

export async function obtenerPep(id: string): Promise<PepResponse> {
  const { data } = await apiClient.get<PepResponse>(`${BASE_PATH}/${id}`);
  return data;
}

export async function crearPep(input: CrearPepInput): Promise<PepResponse> {
  const { data } = await apiClient.post<PepResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarPep(
  id: string,
  input: ActualizarPepInput,
): Promise<PepResponse> {
  const { data } = await apiClient.put<PepResponse>(`${BASE_PATH}/${id}`, input);
  return data;
}

export async function eliminarPep(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
