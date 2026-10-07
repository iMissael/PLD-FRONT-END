/** Fecha y hora local corta (dd/mm/aaaa hh:mm); "—" si no hay valor. */
export function fechaHora(valor: string | null | undefined): string {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
}
