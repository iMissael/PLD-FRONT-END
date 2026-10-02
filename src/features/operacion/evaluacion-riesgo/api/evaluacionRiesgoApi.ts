import { apiClient } from "@/api/client";
import type {
  EvaluacionRiesgoResultado,
  EvaluacionRiesgoSolicitud,
  ModificarNivelRiesgoInput,
} from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";

export async function evaluarRiesgo(payload: EvaluacionRiesgoSolicitud) {
  const { data } = await apiClient.post<EvaluacionRiesgoResultado>(
    "/pld/evaluaciones",
    payload,
  );
  return data;
}

/**
 * Asigna manualmente el nivel de riesgo de una evaluación ya calculada (pantalla
 * "Modificación de riesgo"). El nivel calculado original no se pierde: la respuesta trae
 * ambos (`nivel_riesgo` y `nivel_riesgo_manual`).
 */
export async function modificarNivelRiesgo(
  llaveSeguimiento: number,
  input: ModificarNivelRiesgoInput,
) {
  const { data } = await apiClient.put<EvaluacionRiesgoResultado>(
    `/pld/evaluaciones/${llaveSeguimiento}/nivel-manual`,
    input,
  );
  return data;
}

/** Todas las evaluaciones de un socio, de la más reciente a la más antigua. */
export async function listarHistorialEvaluaciones(socioRef: string) {
  const { data } = await apiClient.get<EvaluacionRiesgoResultado[]>(
    `/pld/evaluaciones/historial/${socioRef}`,
  );
  return data;
}
