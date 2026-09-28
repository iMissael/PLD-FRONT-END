import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarActividadEconomica,
  crearActividadEconomica,
  eliminarActividadEconomica,
} from "../api/actividadesEconomicasApi";
import type {
  ActualizarActividadEconomicaInput,
  CrearActividadEconomicaInput,
} from "../types/actividadEconomica";
import { actividadesEconomicasKeys } from "./actividadesEconomicasKeys";

export function useCrearActividadEconomica() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearActividadEconomicaInput) => crearActividadEconomica(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actividadesEconomicasKeys.all });
    },
  });
}

export function useActualizarActividadEconomica() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: ActualizarActividadEconomicaInput;
    }) => actualizarActividadEconomica(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actividadesEconomicasKeys.all });
    },
  });
}

/** Baja lógica: el backend marca `estatus = 'E'` y deja de listarla. */
export function useEliminarActividadEconomica() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarActividadEconomica(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actividadesEconomicasKeys.all });
    },
  });
}
