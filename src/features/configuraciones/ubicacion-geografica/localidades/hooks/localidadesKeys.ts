import type { ListarLocalidadesParams } from "../api/localidadesApi";

export const localidadesKeys = {
  all: ["localidades"] as const,
  listas: () => [...localidadesKeys.all, "lista"] as const,
  /** La página y el tamaño entran en la key: cada página es una entrada de caché. */
  lista: (params?: ListarLocalidadesParams) =>
    [...localidadesKeys.listas(), params ?? null] as const,
};

export const municipiosKeys = {
  all: ["municipios"] as const,
  lista: (params?: { busqueda?: string; filtrarPor?: string; entidadId?: string }) =>
    [...municipiosKeys.all, params ?? null] as const,
};
