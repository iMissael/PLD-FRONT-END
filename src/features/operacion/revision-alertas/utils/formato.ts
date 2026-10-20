/** "2026-09-28" o "2026-09-28T14:03:00-06:00" -> "28/09/2026". */
export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return "—";
  const [anio, mes, dia] = valor.slice(0, 10).split("-");
  if (!anio || !mes || !dia) return valor;
  return `${dia}/${mes}/${anio}`;
}

/** Qué tan cerca está el último día para dictaminar: 5 días o menos es urgente; 10 o menos, próximo. */
export type NivelPlazo = "urgente" | "proximo" | "holgado";

export function nivelPlazo(diasRestantes: number): NivelPlazo {
  if (diasRestantes <= 5) return "urgente";
  if (diasRestantes <= 10) return "proximo";
  return "holgado";
}

/** 0 -> "Vence hoy", 1 -> "Queda 1 día", 12 -> "Quedan 12 días". */
export function textoDiasRestantes(diasRestantes: number): string {
  if (diasRestantes <= 0) return "Vence hoy";
  return diasRestantes === 1 ? "Queda 1 día" : `Quedan ${diasRestantes} días`;
}

export function formatearMoneda(
  importe: number | null | undefined,
  moneda: string,
): string {
  if (importe === null || importe === undefined) return "—";
  const texto = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(importe);
  return moneda === "MXN" ? texto : `${texto} ${moneda}`;
}
