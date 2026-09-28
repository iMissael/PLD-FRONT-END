import { useMutation, useQuery } from "@tanstack/react-query";
import {
  evaluarRiesgo,
  obtenerEvaluacionPorId,
} from "@/features/operacion/evaluacion-riesgo/api/evaluacionRiesgoApi";

export function useEvaluarRiesgo() {
  return useMutation({
    mutationFn: evaluarRiesgo,
  });
}

export function useEvaluacionPorId(llaveSeguimiento: number | null) {
  return useQuery({
    queryKey: ["evaluacion-riesgo", llaveSeguimiento],
    queryFn: () => obtenerEvaluacionPorId(llaveSeguimiento as number),
    enabled: llaveSeguimiento !== null,
    retry: false,
  });
}
