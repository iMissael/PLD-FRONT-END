import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cambiarNivelRiesgoHistorial } from "../api/historialesCrediticiosApi";
import type { CambiarNivelRiesgoHistorialInput } from "../types/historialCrediticio";
import { historialesCrediticiosKeys } from "./historialesCrediticiosKeys";

/**
 * Única mutación del feature: el catálogo no admite alta ni baja desde el
 * front, solo ajustar el nivel de riesgo de cada caso.
 */
export function useCambiarNivelRiesgoHistorial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CambiarNivelRiesgoHistorialInput }) =>
      cambiarNivelRiesgoHistorial(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historialesCrediticiosKeys.all });
    },
  });
}
