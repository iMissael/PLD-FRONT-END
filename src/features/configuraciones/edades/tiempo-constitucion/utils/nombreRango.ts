/**
 * Genera la etiqueta de un tiempo de constitución a partir de su rango de
 * años. El usuario no captura el nombre: esta función es la única fuente.
 *
 * Las reglas reproducen exactamente las etiquetas que ya existían en el
 * catálogo sembrado, para no cambiar cómo se leen los registros actuales:
 *
 * | Rango      | Etiqueta            |
 * |------------|---------------------|
 * | 0 – 1      | Menos de 1 año      |
 * | 1 – 3      | De 1 a 3 años       |
 * | 5 – 10     | De 5 a 10 años      |
 * | 10 – null  | Más de 10 años      |
 */
export function generarNombreRango(aniosMin: number, aniosMax: number | null): string {
  if (aniosMax === null) {
    return `Más de ${aniosMin} ${pluralizarAnios(aniosMin)}`;
  }
  if (aniosMin === 0) {
    return `Menos de ${aniosMax} ${pluralizarAnios(aniosMax)}`;
  }
  return `De ${aniosMin} a ${aniosMax} ${pluralizarAnios(aniosMax)}`;
}

function pluralizarAnios(cantidad: number): string {
  return cantidad === 1 ? "año" : "años";
}
