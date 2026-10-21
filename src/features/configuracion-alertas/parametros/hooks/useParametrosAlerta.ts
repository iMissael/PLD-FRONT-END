import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  agregarDiaInhabil,
  cambiarEstatusDiaInhabil,
  guardarParametros,
  guardarPlazos,
  listarDiasInhabiles,
  listarPlazos,
  obtenerParametros,
} from "../api/parametrosAlertaApi";
import type {
  AgregarDiaInhabilInput,
  GuardarPlazosInput,
  ParametrosAlerta,
} from "../types/parametrosAlerta";

export const parametrosAlertaKeys = {
  all: ["parametros-alerta"] as const,
  generales: () => [...parametrosAlertaKeys.all, "generales"] as const,
  plazos: () => [...parametrosAlertaKeys.all, "plazos"] as const,
  diasInhabiles: (anio: number) =>
    [...parametrosAlertaKeys.all, "dias-inhabiles", anio] as const,
};

export function useParametrosAlerta() {
  return useQuery({
    queryKey: parametrosAlertaKeys.generales(),
    queryFn: obtenerParametros,
  });
}

export function useGuardarParametros() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ParametrosAlerta) => guardarParametros(input),
    onSuccess: (data) => queryClient.setQueryData(parametrosAlertaKeys.generales(), data),
  });
}

export function usePlazosAlerta() {
  return useQuery({ queryKey: parametrosAlertaKeys.plazos(), queryFn: listarPlazos });
}

export function useGuardarPlazos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ acronimo, input }: { acronimo: string; input: GuardarPlazosInput }) =>
      guardarPlazos(acronimo, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: parametrosAlertaKeys.plazos() }),
  });
}

export function useDiasInhabiles(anio: number) {
  return useQuery({
    queryKey: parametrosAlertaKeys.diasInhabiles(anio),
    queryFn: () => listarDiasInhabiles(anio),
  });
}

export function useAgregarDiaInhabil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AgregarDiaInhabilInput) => agregarDiaInhabil(input),
    onSuccess: (dia) =>
      queryClient.invalidateQueries({
        queryKey: parametrosAlertaKeys.diasInhabiles(Number(dia.fecha.slice(0, 4))),
      }),
  });
}

export function useCambiarEstatusDiaInhabil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      cambiarEstatusDiaInhabil(id, activo),
    onSuccess: (dia) =>
      queryClient.invalidateQueries({
        queryKey: parametrosAlertaKeys.diasInhabiles(Number(dia.fecha.slice(0, 4))),
      }),
  });
}
