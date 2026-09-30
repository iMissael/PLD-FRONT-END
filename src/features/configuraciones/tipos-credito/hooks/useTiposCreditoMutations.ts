import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarTipoCredito,
  crearTipoCredito,
  eliminarTipoCredito,
} from "../api/tiposCreditoApi";
import type {
  ActualizarTipoCreditoInput,
  CrearTipoCreditoInput,
} from "../types/tipoCredito";
import { tiposCreditoKeys } from "./tiposCreditoKeys";

export function useCrearTipoCredito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearTipoCreditoInput) => crearTipoCredito(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposCreditoKeys.all });
    },
  });
}

export function useActualizarTipoCredito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarTipoCreditoInput }) =>
      actualizarTipoCredito(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposCreditoKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarlo. */
export function useEliminarTipoCredito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarTipoCredito(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposCreditoKeys.all });
    },
  });
}
