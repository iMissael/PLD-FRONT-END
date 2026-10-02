import type { AxiosInstance } from "axios";
import { useEvaluacionesSesionStore } from "@/features/operacion/evaluacion-riesgo/stores/evaluacionesSesionStore";

const METODOS_DE_ESCRITURA = new Set(["post", "put", "patch", "delete"]);
// Lo que cambia el resultado de una evaluación: los catálogos (sus niveles de riesgo) y la matriz.
const RUTAS_QUE_CAMBIAN_EL_RIESGO = ["/catalogos/", "/configuracion-matriz"];

export function cambiaElRiesgo(metodo: string | undefined, url: string | undefined) {
  if (!metodo || !url) return false;
  return (
    METODOS_DE_ESCRITURA.has(metodo.toLowerCase()) &&
    RUTAS_QUE_CAMBIAN_EL_RIESGO.some((ruta) => url.includes(ruta))
  );
}

/**
 * Tras guardar un cambio en un catálogo o publicar una matriz, las evaluaciones recordadas en la
 * pestaña ya no reflejan el riesgo actual: se descartan para que el socio se evalúe de nuevo.
 */
export function registrarInvalidacionDeEvaluaciones(cliente: AxiosInstance) {
  cliente.interceptors.response.use((respuesta) => {
    if (cambiaElRiesgo(respuesta.config.method, respuesta.config.url)) {
      useEvaluacionesSesionStore.getState().limpiar();
    }
    return respuesta;
  });
}
