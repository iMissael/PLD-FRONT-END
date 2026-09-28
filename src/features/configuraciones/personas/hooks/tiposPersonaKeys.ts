export const tiposPersonaKeys = {
  all: ["tipos-persona"] as const,
  listas: () => [...tiposPersonaKeys.all, "lista"] as const,
  lista: () => [...tiposPersonaKeys.listas()] as const,
  detalle: (id: string) => [...tiposPersonaKeys.all, "detalle", id] as const,
};
