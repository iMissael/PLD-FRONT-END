import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarZona,
  asignarEntidades,
  cambiarEstatusZona,
  crearZona,
  eliminarZona,
} from "../api/zonasGeograficasApi";
import type {
  ActualizarZonaGeograficaInput,
  CrearZonaGeograficaInput,
  EstatusZona,
} from "../types/zonaGeografica";
import { zonasGeograficasKeys } from "./zonasGeograficasKeys";

export function useCrearZona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearZonaGeograficaInput) => crearZona(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zonasGeograficasKeys.all });
    },
  });
}

export function useActualizarZona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarZonaGeograficaInput }) =>
      actualizarZona(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zonasGeograficasKeys.all });
    },
  });
}

export function useCambiarEstatusZona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estatus }: { id: string; estatus: EstatusZona }) =>
      cambiarEstatusZona(id, estatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zonasGeograficasKeys.all });
    },
  });
}

export function useEliminarZona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarZona(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zonasGeograficasKeys.all });
    },
  });
}

export function useAsignarEntidadesAZona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, entidadIds }: { id: string; entidadIds: string[] }) =>
      asignarEntidades(id, entidadIds),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: zonasGeograficasKeys.entidadesDeZona(id),
      });
      queryClient.invalidateQueries({ queryKey: zonasGeograficasKeys.listas() });
      queryClient.invalidateQueries({
        queryKey: zonasGeograficasKeys.todasLasEntidades(),
      });
    },
  });
}
