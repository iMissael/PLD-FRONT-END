import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  buscarEmpleados,
  capturarAlertaManual,
  dictaminarAlerta,
  listarAlertas,
  listarRazonesAlerta,
  listarTiposAlerta,
  obtenerExpedienteAlerta,
} from "../api/alertasApi";
import type {
  CrearAlertaManualInput,
  DictamenInput,
  FiltroAlertas,
} from "../types/alertas";

export const alertasKeys = {
  all: ["alertas-pld"] as const,
  tipos: () => [...alertasKeys.all, "tipos"] as const,
  razones: (acronimo?: string) =>
    [...alertasKeys.all, "razones", acronimo ?? "todas"] as const,
  listas: () => [...alertasKeys.all, "lista"] as const,
  lista: (filtro: FiltroAlertas) => [...alertasKeys.listas(), filtro] as const,
  expedientes: () => [...alertasKeys.all, "expediente"] as const,
  expediente: (id: number) => [...alertasKeys.expedientes(), id] as const,
};

/** Catálogo de tipos de alerta (cambia muy poco). */
export function useTiposAlerta() {
  return useQuery({
    queryKey: alertasKeys.tipos(),
    queryFn: listarTiposAlerta,
    staleTime: 5 * 60_000,
  });
}

/** Sin acrónimo trae todas las razones. */
export function useRazonesAlerta(alertaAcronimo?: string, habilitado = true) {
  return useQuery({
    queryKey: alertasKeys.razones(alertaAcronimo),
    queryFn: () => listarRazonesAlerta(alertaAcronimo || undefined),
    enabled: habilitado,
    staleTime: 5 * 60_000,
  });
}

export function useListaAlertas(filtro: FiltroAlertas) {
  return useQuery({
    queryKey: alertasKeys.lista(filtro),
    queryFn: () => listarAlertas(filtro),
  });
}

/** Evaluado y resumen del periodo de la alerta seleccionada en la revisión. */
export function useExpedienteAlerta(id: number) {
  return useQuery({
    queryKey: alertasKeys.expediente(id),
    queryFn: () => obtenerExpedienteAlerta(id),
  });
}

export function useCapturarAlerta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearAlertaManualInput) => capturarAlertaManual(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertasKeys.listas() });
      // Una alerta nueva cambia las "Alertas emitidas" del resumen del periodo.
      queryClient.invalidateQueries({ queryKey: alertasKeys.expedientes() });
    },
  });
}

export function useDictaminarAlerta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: DictamenInput }) =>
      dictaminarAlerta(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertasKeys.listas() }),
  });
}

/** Lista de empleados del core; se pide solo cuando se abre el buscador. */
export function useListaEmpleados(habilitado: boolean) {
  return useQuery({
    queryKey: ["empleados", "lista"],
    queryFn: () => buscarEmpleados(""),
    enabled: habilitado,
    staleTime: 60_000,
  });
}
