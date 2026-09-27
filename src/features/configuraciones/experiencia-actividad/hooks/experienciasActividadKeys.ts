export const experienciasActividadKeys = {
  all: ["experiencias-actividad"] as const,
  listas: () => [...experienciasActividadKeys.all, "lista"] as const,
  lista: () => [...experienciasActividadKeys.listas()] as const,
  detalle: (id: string) => [...experienciasActividadKeys.all, "detalle", id] as const,
};
