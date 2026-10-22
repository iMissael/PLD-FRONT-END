import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listarIncidenciasPendientes,
  resolverDuplicadoAcreditado,
  resolverIncidencia,
  resolverPersonaRelacionada,
  sincronizarAcreditados,
} from "../api/incidenciasApi";
import type {
  ResolverDuplicadoPayload,
  ResolverIncidenciaPayload,
  ResolverPersonaRelacionadaPayload,
} from "../types/incidencias";

const incidenciasKeys = {
  pendientes: ["incidencias", "pendientes"] as const,
};

/** El backend escanea solo cada 5 minutos; con esto lo nuevo aparece sin tocar "Actualizar". */
const REFRESCO_AUTOMATICO_MS = 60_000;

export function useIncidenciasPendientes() {
  return useQuery({
    queryKey: incidenciasKeys.pendientes,
    queryFn: listarIncidenciasPendientes,
    refetchInterval: REFRESCO_AUTOMATICO_MS,
  });
}

/** Trae a los acreditados del sistema externo y escanea a los nuevos; despues se recarga la lista. */
export function useSincronizarAcreditados() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sincronizarAcreditados,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: incidenciasKeys.pendientes }),
  });
}

export function useResolverIncidencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      acreditadoRef,
      payload,
    }: {
      acreditadoRef: string;
      payload: ResolverIncidenciaPayload;
    }) => resolverIncidencia(acreditadoRef, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: incidenciasKeys.pendientes }),
  });
}

export function useResolverDuplicadoAcreditado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      acreditadoRef,
      acreditadoRefSimilar,
      payload,
    }: {
      acreditadoRef: string;
      acreditadoRefSimilar: string;
      payload: ResolverDuplicadoPayload;
    }) => resolverDuplicadoAcreditado(acreditadoRef, acreditadoRefSimilar, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: incidenciasKeys.pendientes }),
  });
}

export function useResolverPersonaRelacionada() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      acreditadoRef,
      idCoincidencia,
      payload,
    }: {
      acreditadoRef: string;
      idCoincidencia: number;
      payload: ResolverPersonaRelacionadaPayload;
    }) => resolverPersonaRelacionada(acreditadoRef, idCoincidencia, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: incidenciasKeys.pendientes }),
  });
}
