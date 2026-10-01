import { apiClient } from "@/api/client";

import type {
  EstadoRegla,
  FiltroReglas,
  GuardarReglaInput,
  ReglaAlerta,
} from "../types/reglaAlerta";

const BASE_PATH = "/v1/pld/configuracion-alertas";

export async function listarReglas(filtro: FiltroReglas): Promise<ReglaAlerta[]> {
  const params = Object.fromEntries(
    Object.entries(filtro).filter(([, v]) => v !== undefined && v !== ""),
  );
  const { data } = await apiClient.get<ReglaAlerta[]>(BASE_PATH, { params });
  return data;
}

export async function crearRegla(input: GuardarReglaInput): Promise<ReglaAlerta> {
  const { data } = await apiClient.post<ReglaAlerta>(BASE_PATH, input);
  return data;
}

export async function actualizarRegla(
  id: string,
  input: GuardarReglaInput,
): Promise<ReglaAlerta> {
  const { data } = await apiClient.put<ReglaAlerta>(`${BASE_PATH}/${id}`, input);
  return data;
}

export async function cambiarEstadoRegla(
  id: string,
  estado: EstadoRegla,
): Promise<ReglaAlerta> {
  const { data } = await apiClient.patch<ReglaAlerta>(`${BASE_PATH}/${id}/estado`, null, {
    params: { estado },
  });
  return data;
}

/** Baja lógica (estatus E): deja de listarse y de evaluarse. */
export async function eliminarRegla(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
