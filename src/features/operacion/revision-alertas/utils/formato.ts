/** "2026-09-28" o "2026-09-28T14:03:00-06:00" -> "28/09/2026". */
export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return "—";
  const [anio, mes, dia] = valor.slice(0, 10).split("-");
  if (!anio || !mes || !dia) return valor;
  return `${dia}/${mes}/${anio}`;
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
