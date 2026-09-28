import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarTiempoConstitucion,
  crearTiempoConstitucion,
  eliminarTiempoConstitucion,
} from "../api/tiemposConstitucionApi";
import type {
  ActualizarTiempoConstitucionInput,
  CrearTiempoConstitucionInput,
} from "../types/tiempoConstitucion";
import { tiemposConstitucionKeys } from "./tiemposConstitucionKeys";

export function useCrearTiempoConstitucion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearTiempoConstitucionInput) => crearTiempoConstitucion(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiemposConstitucionKeys.all });
    },
  });
}

export function useActualizarTiempoConstitucion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: ActualizarTiempoConstitucionInput;
    }) => actualizarTiempoConstitucion(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiemposConstitucionKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarlo. */
export function useEliminarTiempoConstitucion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarTiempoConstitucion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiemposConstitucionKeys.all });
    },
  });
}
