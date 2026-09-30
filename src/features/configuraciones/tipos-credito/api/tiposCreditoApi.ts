import { apiClient } from "@/api/client";

import type {
  ActualizarTipoCreditoInput,
  CrearTipoCreditoInput,
  TipoCreditoResponse,
} from "../types/tipoCredito";

const BASE_PATH = "/catalogos/tipos-credito";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados en
 * el listado, así que no hace falta ningún parámetro de estatus.
 */
export async function listarTiposCredito(): Promise<TipoCreditoResponse[]> {
  const { data } = await apiClient.get<TipoCreditoResponse[]>(BASE_PATH);
  return data;
}

export async function crearTipoCredito(
  input: CrearTipoCreditoInput,
): Promise<TipoCreditoResponse> {
  const { data } = await apiClient.post<TipoCreditoResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarTipoCredito(
  id: string,
  input: ActualizarTipoCreditoInput,
): Promise<TipoCreditoResponse> {
  const { data } = await apiClient.put<TipoCreditoResponse>(
    `${BASE_PATH}/${id}`,
    input,
  );
  return data;
}

export async function eliminarTipoCredito(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
