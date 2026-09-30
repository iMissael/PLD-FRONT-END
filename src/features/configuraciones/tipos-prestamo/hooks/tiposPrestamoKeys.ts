export const tiposPrestamoKeys = {
  all: ["tipos-prestamo"] as const,
  listas: () => [...tiposPrestamoKeys.all, "lista"] as const,
  lista: () => [...tiposPrestamoKeys.listas()] as const,
};
