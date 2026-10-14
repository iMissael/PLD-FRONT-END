import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listarIncidenciasPendientes,
  resolverDuplicadoSocio,
  resolverIncidencia,
} from "../api/incidenciasApi";
import type { ResolverDuplicadoPayload, ResolverIncidenciaPayload } from "../types/incidencias";

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
      socioRef,
      payload,
    }: {
      socioRef: string;
      payload: ResolverIncidenciaPayload;
    }) => resolverIncidencia(socioRef, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: incidenciasKeys.pendientes }),
  });
}

export function useResolverDuplicadoSocio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      socioRef,
      socioRefSimilar,
      payload,
    }: {
      socioRef: string;
      socioRefSimilar: string;
      payload: ResolverDuplicadoPayload;
    }) => resolverDuplicadoSocio(socioRef, socioRefSimilar, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: incidenciasKeys.pendientes }),
  });
}
