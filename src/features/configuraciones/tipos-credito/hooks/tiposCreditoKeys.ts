export const tiposCreditoKeys = {
  all: ["tipos-credito"] as const,
  listas: () => [...tiposCreditoKeys.all, "lista"] as const,
  lista: () => [...tiposCreditoKeys.listas()] as const,
};
