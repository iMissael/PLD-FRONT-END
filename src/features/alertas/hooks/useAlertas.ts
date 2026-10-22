import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  agregarObservacionAlerta,
  buscarEmpleados,
  buscarEmpleadosPaginados,
  cancelarAlerta,
  capturarAlertaManual,
  dictaminarAlerta,
  listarAlertas,
  listarRazonesAlerta,
  listarTiposAlerta,
  obtenerExpedienteAlerta,
  obtenerHistorialAlerta,
  obtenerMovimientoAlerta,
  reclasificarAlertaComoInusual,
} from "../api/alertasApi";
import type {
  BusquedaEmpleados,
  CrearAlertaManualInput,
  DictamenInput,
  FiltroAlertas,
  ObservacionInput,
  ReclasificacionInput,
} from "../types/alertas";

export const alertasKeys = {
  all: ["alertas-pld"] as const,
  tipos: () => [...alertasKeys.all, "tipos"] as const,
  razones: (acronimo?: string) =>
    [...alertasKeys.all, "razones", acronimo ?? "todas"] as const,
  listas: () => [...alertasKeys.all, "lista"] as const,
  lista: (filtro: FiltroAlertas, pagina: number, tamanio: number) =>
    [...alertasKeys.listas(), filtro, pagina, tamanio] as const,
  expedientes: () => [...alertasKeys.all, "expediente"] as const,
  expediente: (id: number) => [...alertasKeys.expedientes(), id] as const,
  movimientos: () => [...alertasKeys.all, "movimiento"] as const,
  movimiento: (id: number) => [...alertasKeys.movimientos(), id] as const,
  historiales: () => [...alertasKeys.all, "historial"] as const,
  historial: (id: number) => [...alertasKeys.historiales(), id] as const,
};

export function useTiposAlerta() {
  return useQuery({
    queryKey: alertasKeys.tipos(),
    queryFn: listarTiposAlerta,
    staleTime: 5 * 60_000,
  });
}

export function useRazonesAlerta(alertaAcronimo?: string, habilitado = true) {
  return useQuery({
    queryKey: alertasKeys.razones(alertaAcronimo),
    queryFn: () => listarRazonesAlerta(alertaAcronimo || undefined),
    enabled: habilitado,
    staleTime: 5 * 60_000,
  });
}

export function useListaAlertas(
  filtro: FiltroAlertas,
  pagina: number,
  tamanio: number,
  habilitado = true,
) {
  return useQuery({
    queryKey: alertasKeys.lista(filtro, pagina, tamanio),
    queryFn: () => listarAlertas(filtro, pagina, tamanio),
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });
}

export function useExpedienteAlerta(id: number) {
  return useQuery({
    queryKey: alertasKeys.expediente(id),
    queryFn: () => obtenerExpedienteAlerta(id),
  });
}

export function useMovimientoAlerta(id: number) {
  return useQuery({
    queryKey: alertasKeys.movimiento(id),
    queryFn: () => obtenerMovimientoAlerta(id),
  });
}

export function useCapturarAlerta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearAlertaManualInput) => capturarAlertaManual(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertasKeys.listas() });
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

export function useCancelarAlerta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarAlerta(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertasKeys.listas() }),
  });
}

/** Historial de estatus y observaciones de la alerta seleccionada. */
export function useHistorialAlerta(id: number) {
  return useQuery({
    queryKey: alertasKeys.historial(id),
    queryFn: () => obtenerHistorialAlerta(id),
  });
}

/** "Revisión de alertas de seguimiento": reclasifica una alerta de seguimiento como inusual. */
export function useReclasificarAlerta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ReclasificacionInput }) =>
      reclasificarAlertaComoInusual(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: alertasKeys.listas() });
      queryClient.invalidateQueries({ queryKey: alertasKeys.historial(id) });
    },
  });
}

/** Observación libre sobre una alerta; no cambia su estatus. */
export function useAgregarObservacionAlerta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ObservacionInput }) =>
      agregarObservacionAlerta(id, input),
    onSuccess: (_, { id }) =>
      queryClient.invalidateQueries({ queryKey: alertasKeys.historial(id) }),
  });
}

export function useEmpleadosPaginados(busqueda: BusquedaEmpleados, habilitado: boolean) {
  return useQuery({
    queryKey: ["empleados", "pagina", busqueda],
    queryFn: () => buscarEmpleadosPaginados(busqueda),
    enabled: habilitado,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useListaEmpleados(habilitado: boolean) {
  return useQuery({
    queryKey: ["empleados", "lista"],
    queryFn: () => buscarEmpleados(""),
    enabled: habilitado,
    staleTime: 60_000,
  });
}
