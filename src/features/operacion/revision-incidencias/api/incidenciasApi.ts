import { apiClient } from "@/api/client";

import type {
  CoincidenciaAcreditado,
  ResolverDuplicadoPayload,
  ResolverIncidenciaPayload,
  ResolverPersonaRelacionadaPayload,
} from "../types/incidencias";

export async function listarIncidenciasPendientes() {
  const { data } = await apiClient.get<CoincidenciaAcreditado[]>(
    "/coincidencias/pendientes",
  );
  return data;
}

/** Resultado de traer a todos los acreditados del sistema externo y escanear a los nuevos. */
export interface ResultadoSincronizacion {
  disponible: boolean;
  total: number;
  nuevos: number;
  actualizados: number;
  escaneados: number;
  errores: number;
}

export async function sincronizarAcreditados() {
  const { data } = await apiClient.post<ResultadoSincronizacion>("/acreditados/sincronizacion");
  return data;
}

export async function resolverIncidencia(
  acreditadoRef: string,
  payload: ResolverIncidenciaPayload,
) {
  const { data } = await apiClient.put<CoincidenciaAcreditado>(
    `/coincidencias/${encodeURIComponent(acreditadoRef)}/confirmacion`,
    payload,
  );
  return data;
}

export async function resolverDuplicadoAcreditado(
  acreditadoRef: string,
  acreditadoRefSimilar: string,
  payload: ResolverDuplicadoPayload,
) {
  const { data } = await apiClient.put<CoincidenciaAcreditado>(
    `/coincidencias/${encodeURIComponent(acreditadoRef)}/duplicados/${encodeURIComponent(acreditadoRefSimilar)}/confirmacion`,
    payload,
  );
  return data;
}

export async function resolverPersonaRelacionada(
  acreditadoRef: string,
  idCoincidencia: number,
  payload: ResolverPersonaRelacionadaPayload,
) {
  const { data } = await apiClient.put<CoincidenciaAcreditado>(
    `/coincidencias/${encodeURIComponent(acreditadoRef)}/personas-relacionadas/${idCoincidencia}/confirmacion`,
    payload,
  );
  return data;
}
