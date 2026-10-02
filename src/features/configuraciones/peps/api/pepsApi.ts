import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type { CambiarNivelRiesgoPepInput, PepResponse } from "../types/pep";

const BASE_PATH = "/catalogos/peps";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados en
 * el listado, así que no hace falta ningún parámetro de estatus. El endpoint
 * pagina: se traen todas las páginas porque esta tabla todavía no tiene
 * controles de paginación propios.
 */
export async function listarPeps(): Promise<PepResponse[]> {
  return listarCatalogoCompleto<PepResponse>(BASE_PATH);
}

/**
 * Cambia solo el nivel de riesgo. No hay endpoint dedicado como en
 * Localidades (`PUT /{id}/nivel-riesgo`), así que se usa el `PUT /{id}`
 * general enviando únicamente ese campo: el backend conserva `nombre` y
 * `estatus` porque los recibe en null y el dominio no los sobrescribe.
 */
export async function cambiarNivelRiesgoPep(
  id: string,
  input: CambiarNivelRiesgoPepInput,
): Promise<PepResponse> {
  const { data } = await apiClient.put<PepResponse>(`${BASE_PATH}/${id}`, input);
  return data;
}
