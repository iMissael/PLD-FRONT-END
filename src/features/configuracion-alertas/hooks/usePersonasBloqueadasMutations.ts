import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarPersonaBloqueadaPorRfcCurp,
  cargaMasivaPersonasBloqueadas,
  crearPersonaBloqueada,
  eliminarPersonaBloqueadaPorRfcCurp,
} from "../api/personasBloqueadasApi";
import type { PersonaBloqueadaInput, RfcCurpParams } from "../types/personaBloqueada";
import { personasBloqueadasKeys } from "./personasBloqueadasKeys";

/**
 * Todas las mutations del feature invalidan las consultas del feature al
 * terminar bien, para que la tabla de resultados refleje el cambio sin
 * recargar la página. No hay mutations por id a propósito: todo flujo del
 * front identifica a una persona bloqueada por RFC/CURP.
 */

export function useCrearPersonaBloqueada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PersonaBloqueadaInput) => crearPersonaBloqueada(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personasBloqueadasKeys.all });
    },
  });
}

export function useActualizarPersonaBloqueadaPorRfcCurp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      params,
      input,
    }: {
      params: RfcCurpParams;
      input: PersonaBloqueadaInput;
    }) => actualizarPersonaBloqueadaPorRfcCurp(params, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personasBloqueadasKeys.all });
    },
  });
}

export function useEliminarPersonaBloqueadaPorRfcCurp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RfcCurpParams) => eliminarPersonaBloqueadaPorRfcCurp(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personasBloqueadasKeys.all });
    },
  });
}

export function useCargaMasivaPersonasBloqueadas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (archivo: File) => cargaMasivaPersonasBloqueadas(archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personasBloqueadasKeys.all });
    },
  });
}
