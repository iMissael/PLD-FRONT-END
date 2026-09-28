import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarExperienciaActividad,
  crearExperienciaActividad,
  eliminarExperienciaActividad,
} from "../api/experienciasActividadApi";
import type {
  ActualizarExperienciaActividadInput,
  CrearExperienciaActividadInput,
} from "../types/experienciaActividad";
import { experienciasActividadKeys } from "./experienciasActividadKeys";

export function useCrearExperienciaActividad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearExperienciaActividadInput) =>
      crearExperienciaActividad(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienciasActividadKeys.all });
    },
  });
}

export function useActualizarExperienciaActividad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: ActualizarExperienciaActividadInput;
    }) => actualizarExperienciaActividad(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienciasActividadKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarlo. */
export function useEliminarExperienciaActividad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarExperienciaActividad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienciasActividadKeys.all });
    },
  });
}
