export const actividadesEconomicasKeys = {
  all: ["actividades-economicas"] as const,
  listas: () => [...actividadesEconomicasKeys.all, "lista"] as const,
  lista: () => [...actividadesEconomicasKeys.listas()] as const,
  detalle: (id: string) => [...actividadesEconomicasKeys.all, "detalle", id] as const,
};
