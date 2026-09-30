export const historialesCrediticiosKeys = {
  all: ["historiales-crediticios"] as const,
  listas: () => [...historialesCrediticiosKeys.all, "lista"] as const,
  lista: () => [...historialesCrediticiosKeys.listas()] as const,
};
