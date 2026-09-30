export const origenesRecursoKeys = {
  all: ["origenes-recurso"] as const,
  listas: () => [...origenesRecursoKeys.all, "lista"] as const,
  lista: () => [...origenesRecursoKeys.listas()] as const,
};
