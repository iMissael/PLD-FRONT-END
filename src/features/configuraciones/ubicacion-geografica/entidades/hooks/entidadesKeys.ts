export const entidadesKeys = {
  all: ["entidades"] as const,
  listas: () => [...entidadesKeys.all, "lista"] as const,
  lista: (params?: { busqueda?: string; filtrarPor?: string; idZona?: string }) =>
    [...entidadesKeys.listas(), params ?? null] as const,
  zonasDeEntidad: (id: string | undefined) =>
    [...entidadesKeys.all, "zonas", id] as const,
};
