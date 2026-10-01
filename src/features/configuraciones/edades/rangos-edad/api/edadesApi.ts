import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type { ActualizarEdadInput, CrearEdadInput, EdadResponse } from "../types/edad";

const BASE_PATH = "/catalogos/edades";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados
 * en el listado, así que no hace falta ningún parámetro de estatus. El
 * endpoint pagina: se traen todas las páginas porque esta tabla todavía no
 * tiene controles de paginación propios.
 */
export async function listarEdades(): Promise<EdadResponse[]> {
  return listarCatalogoCompleto<EdadResponse>(BASE_PATH);
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
