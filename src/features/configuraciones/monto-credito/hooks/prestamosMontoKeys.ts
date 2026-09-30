export const prestamosMontoKeys = {
  all: ["prestamos-monto"] as const,
  listas: () => [...prestamosMontoKeys.all, "lista"] as const,
  lista: () => [...prestamosMontoKeys.listas()] as const,
};
