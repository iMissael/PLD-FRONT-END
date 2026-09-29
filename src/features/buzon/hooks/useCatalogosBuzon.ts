import { useQuery } from "@tanstack/react-query";
import { getRazonesAlertaPorTipo, getTiposAlertaBuzon } from "../api/catalogosApi";

export const TIPOS_ALERTA_BUZON_KEY = ["tipos_alerta_buzon"];
export const RAZONES_ALERTA_KEY = ["razones_alerta"];

export function useTiposAlertaBuzon() {
  return useQuery({
    queryKey: TIPOS_ALERTA_BUZON_KEY,
    queryFn: ({ signal }) => getTiposAlertaBuzon(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRazonesAlertaPorTipo(tipoAlertaId: number | null) {
  return useQuery({
    queryKey: [...RAZONES_ALERTA_KEY, tipoAlertaId],
    queryFn: ({ signal }) => (tipoAlertaId ? getRazonesAlertaPorTipo(tipoAlertaId, signal) : []),
    enabled: Boolean(tipoAlertaId),
    staleTime: 5 * 60 * 1000,
  });
}
