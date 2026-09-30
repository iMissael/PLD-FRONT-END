import { apiClient } from "@/api/client";

import type {
  ActualizarPrestamoMontoInput,
  CrearPrestamoMontoInput,
  PrestamoMontoResponse,
} from "../types/prestamoMonto";

const BASE_PATH = "/catalogos/prestamos-monto";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados
 * en el listado.
 */
export async function listarPrestamosMonto(): Promise<PrestamoMontoResponse[]> {
  const { data } = await apiClient.get<PrestamoMontoResponse[]>(BASE_PATH);
  return data;
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
