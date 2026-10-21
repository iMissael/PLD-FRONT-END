export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return "—";
  const [anio, mes, dia] = valor.slice(0, 10).split("-");
  if (!anio || !mes || !dia) return valor;
  return `${dia}/${mes}/${anio}`;
}

export type NivelPlazo = "urgente" | "proximo" | "holgado";

export function nivelPlazo(diasRestantes: number): NivelPlazo {
  if (diasRestantes <= 5) return "urgente";
  if (diasRestantes <= 10) return "proximo";
  return "holgado";
}

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
