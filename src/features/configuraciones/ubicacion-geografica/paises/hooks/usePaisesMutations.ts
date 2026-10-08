import { useMutation, useQueryClient } from "@tanstack/react-query";

import { listasPaisesKeys } from "../../listas-paises/hooks/listasPaisesKeys";
import { actualizarPais, crearPais, eliminarPais } from "../api/paisesApi";
import type { ActualizarPaisInput, CrearPaisInput } from "../types/pais";
import { paisesKeys } from "./paisesKeys";

export function useCrearPais() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearPaisInput) => crearPais(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paisesKeys.all });
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.all });
    },
  });
}

export function useActualizarPais() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarPaisInput }) =>
      actualizarPais(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: paisesKeys.all });
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.all });
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.listasDePais(id) });
    },
  });
}

export function useEliminarPais() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarPais(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paisesKeys.all });
      queryClient.invalidateQueries({ queryKey: listasPaisesKeys.all });
    },
  });
}
