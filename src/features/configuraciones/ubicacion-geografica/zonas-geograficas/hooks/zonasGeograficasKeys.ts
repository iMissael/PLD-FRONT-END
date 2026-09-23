import type { EstatusZona } from "../types/zonaGeografica";

export const zonasGeograficasKeys = {
  all: ["zonas-geograficas"] as const,
  listas: () => [...zonasGeograficasKeys.all, "lista"] as const,
  lista: (estatus?: EstatusZona) =>
    [...zonasGeograficasKeys.listas(), estatus ?? null] as const,
  entidadesDeZona: (id: string) =>
    [...zonasGeograficasKeys.all, "entidades", id] as const,
  paisesDeZona: (id: string) => [...zonasGeograficasKeys.all, "paises", id] as const,
  todasLasEntidades: () => [...zonasGeograficasKeys.all, "todas-entidades"] as const,
  todosLosPaises: () => [...zonasGeograficasKeys.all, "todos-paises"] as const,
};
