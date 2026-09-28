import { useMutation, useQueryClient } from "@tanstack/react-query";

import { actualizarEdad, crearEdad, eliminarEdad } from "../api/edadesApi";
import type { ActualizarEdadInput, CrearEdadInput } from "../types/edad";
import { edadesKeys } from "./edadesKeys";

export function useCrearEdad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearEdadInput) => crearEdad(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: edadesKeys.all });
    },
  });
}

export function useActualizarEdad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarEdadInput }) =>
      actualizarEdad(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: edadesKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarlo. */
export function useEliminarEdad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarEdad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: edadesKeys.all });
    },
  });
}
