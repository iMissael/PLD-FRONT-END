import { apiClient } from "@/api/client";

import type {
  CoincidenciaSocio,
  ResolverIncidenciaPayload,
} from "../types/incidencias";

export async function listarIncidenciasPendientes() {
  const { data } = await apiClient.get<CoincidenciaSocio[]>(
    "/pld/coincidencias/pendientes",
  );
  return data;
}

export async function resolverIncidencia(
  socioRef: string,
  payload: ResolverIncidenciaPayload,
) {
  const { data } = await apiClient.put<CoincidenciaSocio>(
    `/pld/coincidencias/${encodeURIComponent(socioRef)}/confirmacion`,
    payload,
  );
  return data;
}
