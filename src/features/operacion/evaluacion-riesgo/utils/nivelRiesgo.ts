/**
 * Los 5 niveles regulatorios (BAJO..ALTO). El backend solo manda el nivel del
 * total general (resultado.nivel_riesgo); el de cada factor y subfactor se
 * deriva aqui con la misma formula que usa CalculadoraScoreTotal
 * ((promedio-1)*25 contra las bandas 0/20/40/60/80), para que el color de un
 * factor sea consistente con como se calculo su propio "Valor total".
 */
export const NIVELES_RIESGO = [
  {
    label: "Bajo",
    suave: "border-green-200 bg-green-50 text-green-700",
    solido: "bg-green-600 text-white",
  },
  {
    label: "Medio bajo",
    suave: "border-lime-200 bg-lime-50 text-lime-700",
    solido: "bg-lime-600 text-white",
  },
  {
    label: "Medio",
    suave: "border-amber-200 bg-amber-50 text-amber-700",
    solido: "bg-amber-500 text-slate-950",
  },
  {
    label: "Medio alto",
    suave: "border-orange-200 bg-orange-50 text-orange-700",
    solido: "bg-orange-600 text-white",
  },
  {
    label: "Alto",
    suave: "border-red-200 bg-red-50 text-red-700",
    solido: "bg-red-600 text-white",
  },
] as const;

export type NivelRiesgoInfo = (typeof NIVELES_RIESGO)[number];

export function nivelDesdePromedio(
  promedio: number | undefined,
): NivelRiesgoInfo | undefined {
  if (promedio === undefined || Number.isNaN(promedio)) return undefined;
  const score = Math.max(0, (promedio - 1) * 25);
  if (score >= 80) return NIVELES_RIESGO[4];
  if (score >= 60) return NIVELES_RIESGO[3];
  if (score >= 40) return NIVELES_RIESGO[2];
  if (score >= 20) return NIVELES_RIESGO[1];
  return NIVELES_RIESGO[0];
}

export function nivelPorValorEntero(
  valor: number | undefined,
): NivelRiesgoInfo | undefined {
  if (valor === undefined) return undefined;
  return NIVELES_RIESGO[Math.min(5, Math.max(1, Math.round(valor))) - 1];
}
