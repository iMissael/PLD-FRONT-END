import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarPrestamoMonto,
  crearPrestamoMonto,
  eliminarPrestamoMonto,
} from "../api/prestamosMontoApi";
import type {
  ActualizarPrestamoMontoInput,
  CrearPrestamoMontoInput,
} from "../types/prestamoMonto";
import { prestamosMontoKeys } from "./prestamosMontoKeys";

export function useCrearPrestamoMonto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearPrestamoMontoInput) => crearPrestamoMonto(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prestamosMontoKeys.all });
    },
  });
}

export function useActualizarPrestamoMonto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarPrestamoMontoInput }) =>
      actualizarPrestamoMonto(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prestamosMontoKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarlo. */
export function useEliminarPrestamoMonto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarPrestamoMonto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prestamosMontoKeys.all });
    },
  });
}
