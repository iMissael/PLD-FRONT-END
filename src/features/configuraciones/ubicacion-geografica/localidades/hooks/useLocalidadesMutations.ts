import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cambiarNivelRiesgoLocalidad } from "../api/localidadesApi";
import type { CambiarNivelRiesgoLocalidadInput } from "../types/localidad";
import { localidadesKeys } from "./localidadesKeys";

export function useCambiarNivelRiesgoLocalidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: CambiarNivelRiesgoLocalidadInput;
    }) => cambiarNivelRiesgoLocalidad(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localidadesKeys.all });
    },
  });
}
