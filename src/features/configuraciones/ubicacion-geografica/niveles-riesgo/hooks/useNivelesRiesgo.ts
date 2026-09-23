import { useQuery } from "@tanstack/react-query";

import { listarNivelesRiesgo } from "../api/nivelesRiesgoApi";

export const nivelesRiesgoKeys = {
  all: ["niveles-riesgo"] as const,
};

/**
 * Catálogo pequeño y estable: `staleTime` largo para no volver a pedirlo
 * cada vez que se abre un formulario que lo usa como `<select>`.
 */
export function useNivelesRiesgo() {
  return useQuery({
    queryKey: nivelesRiesgoKeys.all,
    queryFn: listarNivelesRiesgo,
    staleTime: 5 * 60 * 1000,
  });
}
