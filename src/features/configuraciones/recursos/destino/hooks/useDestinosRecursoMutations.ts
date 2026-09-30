import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarDestinoRecurso,
  crearDestinoRecurso,
  eliminarDestinoRecurso,
} from "../api/destinosRecursoApi";
import type {
  ActualizarDestinoRecursoInput,
  CrearDestinoRecursoInput,
} from "../types/destinoRecurso";
import { destinosRecursoKeys } from "./destinosRecursoKeys";

export function useCrearDestinoRecurso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearDestinoRecursoInput) => crearDestinoRecurso(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: destinosRecursoKeys.all });
    },
  });
}

export function useActualizarDestinoRecurso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarDestinoRecursoInput }) =>
      actualizarDestinoRecurso(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: destinosRecursoKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarlo. */
export function useEliminarDestinoRecurso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarDestinoRecurso(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: destinosRecursoKeys.all });
    },
  });
}
