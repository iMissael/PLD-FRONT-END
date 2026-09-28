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
    }),
    {
      name: "evaluaciones-sesion",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
