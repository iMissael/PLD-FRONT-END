import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cambiarNivelRiesgoPep } from "../api/pepsApi";
import type { CambiarNivelRiesgoPepInput } from "../types/pep";
import { pepsKeys } from "./pepsKeys";

/**
 * Única mutación del feature: el catálogo no admite alta ni baja desde el
 * front, solo ajustar el nivel de riesgo de cada caso.
 */
export function useCambiarNivelRiesgoPep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CambiarNivelRiesgoPepInput }) =>
      cambiarNivelRiesgoPep(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pepsKeys.all });
    },
  });
}
