import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listarCoincidenciasPendientes,
  resolverCoincidencia,
} from "../api/coincidenciasApi";
import type { ResolverCoincidenciaPayload } from "../types/coincidencias";

const coincidenciasKeys = {
  pendientes: ["coincidencias", "pendientes"] as const,
};

export function useCoincidenciasPendientes() {
  return useQuery({
    queryKey: coincidenciasKeys.pendientes,
    queryFn: listarCoincidenciasPendientes,
  });
}

export function useResolverCoincidencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      socioRef,
      payload,
    }: {
      socioRef: string;
      payload: ResolverCoincidenciaPayload;
    }) => resolverCoincidencia(socioRef, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: coincidenciasKeys.pendientes }),
  });
}
