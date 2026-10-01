import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type {
  ActualizarPrestamoMontoInput,
  CrearPrestamoMontoInput,
  PrestamoMontoResponse,
} from "../types/prestamoMonto";

const BASE_PATH = "/catalogos/prestamos-monto";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados
 * en el listado. El endpoint pagina: se traen todas las páginas porque esta
 * tabla todavía no tiene controles de paginación propios.
 */
export async function listarPrestamosMonto(): Promise<PrestamoMontoResponse[]> {
  return listarCatalogoCompleto<PrestamoMontoResponse>(BASE_PATH);
}

export async function crearPrestamoMonto(
  input: CrearPrestamoMontoInput,
): Promise<PrestamoMontoResponse> {
  const { data } = await apiClient.post<PrestamoMontoResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarPrestamoMonto(
  id: string,
  input: ActualizarPrestamoMontoInput,
): Promise<PrestamoMontoResponse> {
  const { data } = await apiClient.put<PrestamoMontoResponse>(`${BASE_PATH}/${id}`, input);
  return data;
}

export async function eliminarPrestamoMonto(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
