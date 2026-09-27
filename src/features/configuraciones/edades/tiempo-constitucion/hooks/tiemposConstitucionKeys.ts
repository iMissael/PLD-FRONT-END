export const tiemposConstitucionKeys = {
  all: ["tiempos-constitucion"] as const,
  listas: () => [...tiemposConstitucionKeys.all, "lista"] as const,
  lista: () => [...tiemposConstitucionKeys.listas()] as const,
  detalle: (id: string) => [...tiemposConstitucionKeys.all, "detalle", id] as const,
};
