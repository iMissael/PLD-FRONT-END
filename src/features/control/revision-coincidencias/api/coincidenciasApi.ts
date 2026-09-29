import { apiClient } from "@/api/client";

import type {
  CoincidenciaSocio,
  ResolverCoincidenciaPayload,
} from "../types/coincidencias";

export async function listarCoincidenciasPendientes() {
  const { data } = await apiClient.get<CoincidenciaSocio[]>(
    "/pld/coincidencias/pendientes",
  );
  return data;
}

export async function resolverCoincidencia(
  socioRef: string,
  payload: ResolverCoincidenciaPayload,
) {
  const { data } = await apiClient.put<CoincidenciaSocio>(
    `/pld/coincidencias/${encodeURIComponent(socioRef)}/confirmacion`,
    payload,
  );
  return data;
}
