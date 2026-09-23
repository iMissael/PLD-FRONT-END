import type { ConsultaBloqueadosParams } from "../types/personaBloqueada";

/**
 * Fábrica de query keys del feature. Centralizarla evita keys inconsistentes
 * entre el `useQuery` que pide los datos y el `invalidateQueries` que los
 * refresca después de una mutation.
 */
export const personasBloqueadasKeys = {
  all: ["personas-bloqueadas"] as const,
  consultas: () => [...personasBloqueadasKeys.all, "consulta"] as const,
  consulta: (params: ConsultaBloqueadosParams) =>
    [...personasBloqueadasKeys.consultas(), params] as const,
};
