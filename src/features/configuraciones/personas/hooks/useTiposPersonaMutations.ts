import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarTipoPersona,
  crearTipoPersona,
  eliminarTipoPersona,
} from "../api/tiposPersonaApi";
import type {
  ActualizarTipoPersonaInput,
  CrearTipoPersonaInput,
} from "../types/tipoPersona";
import { tiposPersonaKeys } from "./tiposPersonaKeys";

export function useCrearTipoPersona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearTipoPersonaInput) => crearTipoPersona(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposPersonaKeys.all });
    },
  });
}

export function useActualizarTipoPersona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarTipoPersonaInput }) =>
      actualizarTipoPersona(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposPersonaKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarlo. */
export function useEliminarTipoPersona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarTipoPersona(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposPersonaKeys.all });
    },
  });
}
