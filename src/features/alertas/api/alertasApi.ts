import { apiClient } from "@/api/client";

import type {
  Alerta,
  CrearAlertaManualInput,
  DictamenInput,
  EmpleadoExterno,
  FiltroAlertas,
  RazonAlerta,
  TipoAlerta,
} from "../types/alertas";

const BASE = "/v1/pld";

export async function listarTiposAlerta(): Promise<TipoAlerta[]> {
  const { data } = await apiClient.get<TipoAlerta[]>(`${BASE}/tipos-alerta`);
  return data;
}

/** Sin acrónimo trae todas las razones. */
export async function listarRazonesAlerta(
  alertaAcronimo?: string,
): Promise<RazonAlerta[]> {
  const { data } = await apiClient.get<RazonAlerta[]>(`${BASE}/razones-alerta`, {
    params: alertaAcronimo ? { alertaAcronimo } : undefined,
  });
  return data;
}

export async function listarAlertas(filtro: FiltroAlertas): Promise<Alerta[]> {
  // Se quitan los vacíos para no mandar `?estatus=` (el backend no lo acepta como enum).
  const params = Object.fromEntries(
    Object.entries(filtro).filter(([, valor]) => valor !== undefined && valor !== ""),
  );
  const { data } = await apiClient.get<Alerta[]>(`${BASE}/alertas`, { params });
  return data;
}

export async function capturarAlertaManual(
  input: CrearAlertaManualInput,
): Promise<Alerta> {
  const { data } = await apiClient.post<Alerta>(`${BASE}/alertas-manuales`, input);
  return data;
}

export async function dictaminarAlerta(
  id: number,
  input: DictamenInput,
): Promise<Alerta> {
  const { data } = await apiClient.patch<Alerta>(`${BASE}/alertas/${id}/dictamen`, input);
  return data;
}

export async function buscarEmpleados(nombre: string): Promise<EmpleadoExterno[]> {
  const { data } = await apiClient.get<EmpleadoExterno[]>("/empleados/buscar", {
    params: nombre ? { nombre } : undefined,
  });
  return data;
}
