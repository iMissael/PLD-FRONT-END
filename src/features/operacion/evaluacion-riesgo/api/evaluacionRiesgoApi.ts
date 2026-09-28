import { apiClient } from "@/api/client";
import type {
  EvaluacionRiesgoResultado,
  EvaluacionRiesgoSolicitud,
} from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";

export async function evaluarRiesgo(payload: EvaluacionRiesgoSolicitud) {
  const { data } = await apiClient.post<EvaluacionRiesgoResultado>(
    "/pld/evaluaciones",
    payload,
  );
  return data;
}

export async function obtenerEvaluacionPorId(llaveSeguimiento: number) {
  const { data } = await apiClient.get<EvaluacionRiesgoResultado>(
    `/pld/evaluaciones/seguimiento/${llaveSeguimiento}`,
  );
  return data;
}
