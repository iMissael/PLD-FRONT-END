import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listarTiposCambio,
  obtenerTipoCambioVigente,
  registrarTipoCambioManual,
  sincronizarConBanxico,
} from "../api/tipoCambioApi";
import type { TipoCambioManualInput } from "../types/tipoCambio";

export const tipoCambioKeys = {
  all: ["tipo-cambio"] as const,
  lista: (desde: string, hasta: string) =>
    [...tipoCambioKeys.all, "lista", desde, hasta] as const,
  vigente: () => [...tipoCambioKeys.all, "vigente"] as const,
};

export function useTiposCambio(desde: string, hasta: string) {
  return useQuery({
    queryKey: tipoCambioKeys.lista(desde, hasta),
    queryFn: () => listarTiposCambio(desde, hasta),
    enabled: Boolean(desde && hasta),
  });
}

/** 404 = todavía no hay ningún tipo de cambio: no se reintenta. */
export function useTipoCambioVigente() {
  return useQuery({
    queryKey: tipoCambioKeys.vigente(),
    queryFn: obtenerTipoCambioVigente,
    retry: false,
  });
}

export function useRegistrarTipoCambio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TipoCambioManualInput) => registrarTipoCambioManual(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tipoCambioKeys.all }),
  });
}

export function useSincronizarBanxico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ desde, hasta }: { desde: string; hasta: string }) =>
      sincronizarConBanxico(desde, hasta),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tipoCambioKeys.all }),
  });
}
