export const localidadesKeys = {
  all: ["localidades"] as const,
  listas: () => [...localidadesKeys.all, "lista"] as const,
  lista: (params?: {
    busqueda?: string;
    filtrarPor?: string;
    idMunicipio?: string;
    idNivelRiesgo?: number;
  }) => [...localidadesKeys.listas(), params ?? null] as const,
};

export const municipiosKeys = {
  all: ["municipios"] as const,
  lista: (params?: { busqueda?: string; filtrarPor?: string; entidadId?: string }) =>
    [...municipiosKeys.all, params ?? null] as const,
};
