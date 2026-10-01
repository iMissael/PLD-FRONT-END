import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ClienteMatrizRiesgo } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import type { EvaluacionRiesgoResultado } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import type { DetallesSubfactor } from "@/features/operacion/evaluacion-riesgo/utils/detalleSubfactor";
import { getCurrentTenantId } from "@/shared/tenant/tenantStore";

export interface EvaluacionDeSesion {
  resultado: EvaluacionRiesgoResultado;
  cliente: ClienteMatrizRiesgo;
  detalles: DetallesSubfactor;
}

interface EvaluacionesSesionState {
  evaluaciones: Record<string, EvaluacionDeSesion>;
  guardar: (socioRef: string, evaluacion: EvaluacionDeSesion) => void;
  /** Descarta todas: los catálogos o la matriz cambiaron y hay que volver a evaluar. */
  limpiar: () => void;
}

// No hay endpoint para recuperar la evaluación de un socio, así que las hechas en esta
// pestaña se recuerdan (por tenant y socio) para poder volver a verlas desde la lupa.
export function claveEvaluacion(socioRef: string) {
  return `${getCurrentTenantId()}|${socioRef}`;
}

export const useEvaluacionesSesionStore = create<EvaluacionesSesionState>()(
  persist(
    (set) => ({
      evaluaciones: {},
      guardar: (socioRef, evaluacion) =>
        set((estado) => ({
          evaluaciones: {
            ...estado.evaluaciones,
            [claveEvaluacion(socioRef)]: evaluacion,
          },
        })),
      limpiar: () => set({ evaluaciones: {} }),
    }),
    {
      name: "evaluaciones-sesion",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

/**
 * Una evaluación recordada solo sirve si se calculó con la matriz vigente: si se publicó otra
 * versión, el socio se evalúa de nuevo. Mientras no se conoce la matriz activa se da por vigente.
 */
export function evaluacionVigente(
  evaluacion: EvaluacionDeSesion | undefined,
  matrizActivaId: number | undefined,
) {
  if (!evaluacion) return undefined;
  if (matrizActivaId == null) return evaluacion;
  return evaluacion.resultado.id_configuracion_matriz_riesgo === matrizActivaId
    ? evaluacion
    : undefined;
}
