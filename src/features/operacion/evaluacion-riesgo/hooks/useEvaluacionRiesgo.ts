import { useMutation, useQuery } from "@tanstack/react-query";
import {
  evaluarRiesgo,
  listarHistorialEvaluaciones,
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

export function useHistorialEvaluaciones(socioRef: string | null) {
  return useQuery({
    queryKey: ["evaluacion-riesgo-historial", socioRef],
    queryFn: () => listarHistorialEvaluaciones(socioRef as string),
    enabled: socioRef !== null && socioRef !== "",
  });
}
