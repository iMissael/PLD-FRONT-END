import { apiClient } from "@/api/client";

import type {
  AgregarDiaInhabilInput,
  DiaInhabil,
  GuardarPlazosInput,
  ParametrosAlerta,
  PlazosTipoAlerta,
} from "../types/parametrosAlerta";

const PARAMETROS = "/parametros-alerta";
const DIAS_INHABILES = "/dias-inhabiles";

export async function obtenerParametros(): Promise<ParametrosAlerta> {
  const { data } = await apiClient.get<ParametrosAlerta>(PARAMETROS);
  return data;
}

export async function guardarParametros(
  input: ParametrosAlerta,
): Promise<ParametrosAlerta> {
  const { data } = await apiClient.put<ParametrosAlerta>(PARAMETROS, input);
  return data;
}

export async function listarPlazos(): Promise<PlazosTipoAlerta[]> {
  const { data } = await apiClient.get<PlazosTipoAlerta[]>(`${PARAMETROS}/plazos`);
  return data;
}

export async function guardarPlazos(
  alertaAcronimo: string,
  input: GuardarPlazosInput,
): Promise<PlazosTipoAlerta> {
  const { data } = await apiClient.put<PlazosTipoAlerta>(
    `${PARAMETROS}/plazos/${alertaAcronimo}`,
    input,
  );
  return data;
}

export async function listarDiasInhabiles(anio: number): Promise<DiaInhabil[]> {
  const { data } = await apiClient.get<DiaInhabil[]>(DIAS_INHABILES, {
    params: { anio },
  });
  return data;
}

export async function agregarDiaInhabil(
  input: AgregarDiaInhabilInput,
): Promise<DiaInhabil> {
  const { data } = await apiClient.post<DiaInhabil>(DIAS_INHABILES, input);
  return data;
}

export async function cambiarEstatusDiaInhabil(
  id: number,
  activo: boolean,
): Promise<DiaInhabil> {
  const { data } = await apiClient.patch<DiaInhabil>(`${DIAS_INHABILES}/${id}/estatus`, {
    activo,
  });
  return data;
}
