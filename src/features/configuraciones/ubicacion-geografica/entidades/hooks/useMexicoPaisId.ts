import { useMemo } from "react";

import { usePaises } from "../../paises/hooks/usePaises";

/**
 * Todas las entidades de este catálogo son de México. En vez de guardar un
 * ID literal fijo (frágil si el seed cambia), se busca "México" por nombre
 * en el catálogo real de países y se usa su ID.
 */
export function useMexicoPaisId() {
  const { data: paises, isLoading } = usePaises();

  const mexico = useMemo(
    () => paises?.find((pais) => pais.nombre.trim().toLowerCase() === "méxico"),
    [paises],
  );

  return { paisId: mexico?.idPais ?? null, isLoading };
}
