import { useQuery } from "@tanstack/react-query";
import { listarAlertas, verAlertaPorId } from "../api/buzonApi";
import type { ListarAlertasParams } from "../types/buzon";

export const ALERTAS_QUERY_KEY = ["alertas_pld"];

export function useListarAlertas(params?: ListarAlertasParams) {
  return useQuery({
    queryKey: [...ALERTAS_QUERY_KEY, params],
    queryFn: ({ signal }) => listarAlertas(params, signal),
    staleTime: 0,
  });
}

export function useAlertaDetalle(id: number | null) {
  return useQuery({
    queryKey: [...ALERTAS_QUERY_KEY, id],
    queryFn: ({ signal }) => (id ? verAlertaPorId(id, signal) : null),
    enabled: Boolean(id),
    staleTime: 0,
  });
}
