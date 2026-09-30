import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarOrigenRecurso,
  crearOrigenRecurso,
  eliminarOrigenRecurso,
} from "../api/origenesRecursoApi";
import type {
  ActualizarOrigenRecursoInput,
  CrearOrigenRecursoInput,
} from "../types/origenRecurso";
import { origenesRecursoKeys } from "./origenesRecursoKeys";

export function useCrearOrigenRecurso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearOrigenRecursoInput) => crearOrigenRecurso(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: origenesRecursoKeys.all });
    },
  });
}

export function useActualizarOrigenRecurso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarOrigenRecursoInput }) =>
      actualizarOrigenRecurso(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: origenesRecursoKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarlo. */
export function useEliminarOrigenRecurso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarOrigenRecurso(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: origenesRecursoKeys.all });
    },
  });
}
