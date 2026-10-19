import { apiClient } from "@/api/client";

import type {
  CoincidenciaAcreditado,
  ResolverCoincidenciaPayload,
} from "../types/coincidencias";

export async function listarCoincidenciasPendientes() {
  const { data } = await apiClient.get<CoincidenciaAcreditado[]>(
    "/coincidencias/pendientes",
  );
  return data;
}

export async function resolverCoincidencia(
  acreditadoRef: string,
  payload: ResolverCoincidenciaPayload,
) {
  const { data } = await apiClient.put<CoincidenciaAcreditado>(
    `/coincidencias/${encodeURIComponent(acreditadoRef)}/confirmacion`,
    payload,
  );
  return data;
}
