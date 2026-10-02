import { useMutation } from "@tanstack/react-query";
import {
  evaluarRiesgo,
  modificarNivelRiesgo,
} from "@/features/operacion/evaluacion-riesgo/api/evaluacionRiesgoApi";
import type { ModificarNivelRiesgoInput } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";

export function useEvaluarRiesgo() {
  return useMutation({
    mutationFn: evaluarRiesgo,
  });
}

export function useModificarNivelRiesgo() {
  return useMutation({
    mutationFn: ({
      llaveSeguimiento,
      input,
    }: {
      llaveSeguimiento: number;
      input: ModificarNivelRiesgoInput;
    }) => modificarNivelRiesgo(llaveSeguimiento, input),
  });
}
