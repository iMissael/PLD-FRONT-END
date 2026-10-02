export const pepsKeys = {
  all: ["peps"] as const,
  listas: () => [...pepsKeys.all, "lista"] as const,
  lista: () => [...pepsKeys.listas()] as const,
};
