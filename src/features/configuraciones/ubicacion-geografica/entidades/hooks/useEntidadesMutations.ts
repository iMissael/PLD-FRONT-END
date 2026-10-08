import { useMutation, useQueryClient } from "@tanstack/react-query";

import { actualizarEntidad, crearEntidad, eliminarEntidad } from "../api/entidadesApi";
import type { ActualizarEntidadInput, CrearEntidadInput } from "../types/entidad";
import { entidadesKeys } from "./entidadesKeys";

export function useCrearEntidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearEntidadInput) => crearEntidad(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entidadesKeys.all });
    },
  });
}

export function useActualizarEntidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarEntidadInput }) =>
      actualizarEntidad(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entidadesKeys.all });
    },
  });
}

export function useEliminarEntidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarEntidad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entidadesKeys.all });
    },
  });
}
