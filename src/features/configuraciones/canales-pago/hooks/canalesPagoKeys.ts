export const canalesPagoKeys = {
  all: ["canales-pago"] as const,
  listas: () => [...canalesPagoKeys.all, "lista"] as const,
  lista: () => [...canalesPagoKeys.listas()] as const,
};
