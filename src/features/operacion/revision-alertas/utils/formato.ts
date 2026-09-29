/** "2026-09-28" o "2026-09-28T14:03:00-06:00" -> "28/09/2026". */
export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return "—";
  const [anio, mes, dia] = valor.slice(0, 10).split("-");
  if (!anio || !mes || !dia) return valor;
  return `${dia}/${mes}/${anio}`;
}

const PESOS = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function formatearImporte(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? "—" : PESOS.format(valor);
}

/** Primer día del mes anterior hasta hoy: rango por defecto de la revisión. */
export function rangoPorDefecto(hoy = new Date()): { desde: string; hasta: string } {
  const iso = (fecha: Date) =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
  return {
    desde: iso(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)),
    hasta: iso(hoy),
  };
}
