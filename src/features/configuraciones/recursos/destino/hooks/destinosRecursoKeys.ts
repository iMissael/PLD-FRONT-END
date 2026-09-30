export const destinosRecursoKeys = {
  all: ["destinos-recurso"] as const,
  listas: () => [...destinosRecursoKeys.all, "lista"] as const,
  lista: () => [...destinosRecursoKeys.listas()] as const,
};
