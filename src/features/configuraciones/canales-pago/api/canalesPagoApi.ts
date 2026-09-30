import { apiClient } from "@/api/client";

import type {
  ActualizarCanalPagoInput,
  CanalPagoResponse,
  CrearCanalPagoInput,
} from "../types/canalPago";

const BASE_PATH = "/catalogos/canales-pago";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados en
 * el listado, así que no hace falta ningún parámetro de estatus.
 */
export async function listarCanalesPago(): Promise<CanalPagoResponse[]> {
  const { data } = await apiClient.get<CanalPagoResponse[]>(BASE_PATH);
  return data;
}

export async function crearCanalPago(
  input: CrearCanalPagoInput,
): Promise<CanalPagoResponse> {
  const { data } = await apiClient.post<CanalPagoResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarCanalPago(
  id: string,
  input: ActualizarCanalPagoInput,
): Promise<CanalPagoResponse> {
  const { data } = await apiClient.put<CanalPagoResponse>(
    `${BASE_PATH}/${id}`,
    input,
  );
  return data;
}

export async function eliminarCanalPago(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
