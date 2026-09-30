import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarCanalPago,
  crearCanalPago,
  eliminarCanalPago,
} from "../api/canalesPagoApi";
import type {
  ActualizarCanalPagoInput,
  CrearCanalPagoInput,
} from "../types/canalPago";
import { canalesPagoKeys } from "./canalesPagoKeys";

export function useCrearCanalPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearCanalPagoInput) => crearCanalPago(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: canalesPagoKeys.all });
    },
  });
}

export function useActualizarCanalPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarCanalPagoInput }) =>
      actualizarCanalPago(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: canalesPagoKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarlo. */
export function useEliminarCanalPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarCanalPago(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: canalesPagoKeys.all });
    },
  });
}
