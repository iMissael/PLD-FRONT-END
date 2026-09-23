import { useQuery } from "@tanstack/react-query";

import { consultarBloqueados } from "../api/personasBloqueadasApi";
import type { ConsultaBloqueadosParams } from "../types/personaBloqueada";
import { personasBloqueadasKeys } from "./personasBloqueadasKeys";

function hasAtLeastOneFilter(params: ConsultaBloqueadosParams): boolean {
  return Object.values(params).some(
    (value) => typeof value === "string" && value.length > 0,
  );
}

/**
 * Búsqueda de coincidencias en la lista de bloqueados. Es un GET, así que
 * usa `useQuery` (no una mutation) y se beneficia del caché de TanStack
 * Query. Solo se habilita cuando hay al menos un filtro con valor, para no
 * pedir todo el catálogo al entrar a la página.
 */
export function useConsultaBloqueados(params: ConsultaBloqueadosParams) {
  return useQuery({
    queryKey: personasBloqueadasKeys.consulta(params),
    queryFn: () => consultarBloqueados(params),
    enabled: hasAtLeastOneFilter(params),
  });
}
