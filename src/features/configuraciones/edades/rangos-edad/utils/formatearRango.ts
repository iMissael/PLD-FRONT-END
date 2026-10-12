/**
 * Etiqueta de un rango de edad. Compartida por la tabla y el panel de detalle,
 * para que el rango se lea igual en los dos lados.
 *
 * Vive aquí y no en el componente de la tabla porque exportar una función
 * desde un archivo de componentes rompe el fast refresh de React.
 */
export function formatearRango(edadInicial: number, edadFinal: number | null): string {
  if (edadFinal === null) return `${edadInicial} años o más`;
  return `${edadInicial} – ${edadFinal} años`;
}
