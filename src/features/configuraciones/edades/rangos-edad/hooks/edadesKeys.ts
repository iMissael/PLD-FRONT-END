export const edadesKeys = {
  all: ["edades"] as const,
  listas: () => [...edadesKeys.all, "lista"] as const,
  lista: () => [...edadesKeys.listas()] as const,
  detalle: (id: string) => [...edadesKeys.all, "detalle", id] as const,
};
