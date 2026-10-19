import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listarIncidenciasPendientes,
  resolverDuplicadoAcreditado,
  resolverIncidencia,
  resolverPersonaRelacionada,
} from "../api/incidenciasApi";
import type {
  ResolverDuplicadoPayload,
  ResolverIncidenciaPayload,
  ResolverPersonaRelacionadaPayload,
} from "../types/incidencias";

const incidenciasKeys = {
  pendientes: ["incidencias", "pendientes"] as const,
};

export function useIncidenciasPendientes() {
  return useQuery({
    queryKey: incidenciasKeys.pendientes,
    queryFn: listarIncidenciasPendientes,
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
