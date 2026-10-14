import { apiClient } from "@/api/client";

import type {
  CoincidenciaSocio,
  ResolverDuplicadoPayload,
  ResolverIncidenciaPayload,
} from "../types/incidencias";

export async function listarIncidenciasPendientes() {
  const { data } = await apiClient.get<CoincidenciaSocio[]>(
    "/coincidencias/pendientes",
  );
  return data;
}

export async function resolverIncidencia(
  socioRef: string,
  payload: ResolverIncidenciaPayload,
) {
  const { data } = await apiClient.put<CoincidenciaSocio>(
    `/coincidencias/${encodeURIComponent(socioRef)}/confirmacion`,
    payload,
  );
  return data;
}

export async function resolverDuplicadoSocio(
  socioRef: string,
  socioRefSimilar: string,
  payload: ResolverDuplicadoPayload,
) {
  const { data } = await apiClient.put<CoincidenciaSocio>(
    `/coincidencias/${encodeURIComponent(socioRef)}/duplicados/${encodeURIComponent(socioRefSimilar)}/confirmacion`,
    payload,
  );
  return data;
}
