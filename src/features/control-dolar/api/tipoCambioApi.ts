import { apiClient } from "@/api/client";

import type {
  Sincronizacion,
  TipoCambio,
  TipoCambioManualInput,
} from "../types/tipoCambio";

const BASE_PATH = "/v1/pld/tipo-cambio";

export async function listarTiposCambio(
  desde: string,
  hasta: string,
): Promise<TipoCambio[]> {
  const { data } = await apiClient.get<TipoCambio[]>(BASE_PATH, {
    params: { desde, hasta },
  });
  return data;
}

/** El vigente a hoy: el último publicado (fines de semana usan el del viernes). */
export async function obtenerTipoCambioVigente(): Promise<TipoCambio> {
  const { data } = await apiClient.get<TipoCambio>(`${BASE_PATH}/vigente`);
  return data;
}

export async function registrarTipoCambioManual(
  input: TipoCambioManualInput,
): Promise<TipoCambio> {
  const { data } = await apiClient.post<TipoCambio>(BASE_PATH, input);
  return data;
}

export async function sincronizarConBanxico(
  desde: string,
  hasta: string,
): Promise<Sincronizacion> {
  const { data } = await apiClient.post<Sincronizacion>(
    `${BASE_PATH}/sincronizar`,
    null,
    {
      params: { desde, hasta },
    },
  );
  return data;
}
