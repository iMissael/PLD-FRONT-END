import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarListaPais,
  asignarPaisesALista,
  cambiarEstatusListaPais,
  crearListaPais,
  eliminarListaPais,
} from "../api/listasPaisesApi";
import type {
  ActualizarListaPaisInput,
  CrearListaPaisInput,
  EstatusListaPais,
} from "../types/listaPais";
import { listasPaisesKeys } from "./listasPaisesKeys";

export function useCrearListaPais() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearListaPaisInput) => crearListaPais(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.lists() });
    },
  });
}

export function useActualizarListaPais() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarListaPaisInput }) =>
      actualizarListaPais(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.detail(variables.id) });
    },
  });
}

export function useCambiarEstatusListaPais() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estatus }: { id: string; estatus: EstatusListaPais }) =>
      cambiarEstatusListaPais(id, estatus),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.detail(variables.id) });
    },
  });
}

export function useEliminarListaPais() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarListaPais(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.lists() });
    },
  });
}

export function useAsignarPaisesALista() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paisIds }: { id: string; paisIds: string[] }) =>
      asignarPaisesALista(id, paisIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: listasPaisesKeys.paisesDeLista(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.paisesConListas() });
    },
  });
}
