import { apiClient } from "@/api/client";
import type { RazonAlerta, TipoAlertaBuzon } from "../types/catalogos";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store",
};



export async function getTiposAlertaBuzon(signal?: AbortSignal): Promise<TipoAlertaBuzon[]> {
  try {
    const { data } = await apiClient.get<TipoAlertaBuzon[]>(
      "/api/catalogos/tipos-alerta/buzon",
      { headers: NO_CACHE_HEADERS, signal },
    );
    return data
  } catch (error) {
    throw error;
  }
}

export async function getRazonesAlertaPorTipo(
  tipoAlertaId: number,
  signal?: AbortSignal,
): Promise<RazonAlerta[]> {
  try {
    const { data } = await apiClient.get<RazonAlerta[]>(
      `/api/catalogos/razones-alerta/tipo-alerta/${tipoAlertaId}`,
      { headers: NO_CACHE_HEADERS, signal },
    );
    return data
  } catch (error) {
    throw error;
  }
}
