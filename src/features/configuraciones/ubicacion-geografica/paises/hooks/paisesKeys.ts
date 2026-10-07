export const paisesKeys = {
  all: ["paises"] as const,
  listas: () => [...paisesKeys.all, "lista"] as const,
  lista: (params?: { busqueda?: string; filtrarPor?: string }) =>
    [...paisesKeys.listas(), params ?? null] as const,
  listasDePais: (id: string) => [...paisesKeys.all, "listas", id] as const,
};
