import { useMutation, useQueryClient } from "@tanstack/react-query";

import { actualizarPep, crearPep, eliminarPep } from "../api/pepsApi";
import type { ActualizarPepInput, CrearPepInput } from "../types/pep";
import { pepsKeys } from "./pepsKeys";

export function useCrearPep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearPepInput) => crearPep(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pepsKeys.all });
    },
  });
}

export function useActualizarPep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarPepInput }) =>
      actualizarPep(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pepsKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarlo. */
export function useEliminarPep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarPep(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pepsKeys.all });
    },
  });
}
