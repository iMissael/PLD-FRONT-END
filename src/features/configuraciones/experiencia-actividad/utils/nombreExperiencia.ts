/**
 * Genera la etiqueta de una experiencia de actividad a partir de su rango de
 * años. El usuario no captura el nombre: esta función es la única fuente.
 *
 * Las reglas reproducen exactamente las etiquetas del catálogo sembrado. Ojo
 * que la convención NO es la misma que en tiempo de constitución: aquí las
 * etiquetas llevan el prefijo "Experiencia" y `aniosMin = 0` no es un caso
 * especial ("Experiencia 0 a 1 año", no "menos de").
 *
 * | Rango      | Etiqueta                    |
 * |------------|-----------------------------|
 * | 0 – 1      | Experiencia 0 a 1 año       |
 * | 1 – 3      | Experiencia 1 a 3 años      |
 * | 5 – 9      | Experiencia 5 a 9 años      |
 * | 10 – null  | Experiencia 10 años o más   |
 */
export function generarNombreExperiencia(
  aniosMin: number,
  aniosMax: number | null,
): string {
  if (aniosMax === null) {
    return `Experiencia ${aniosMin} ${pluralizarAnios(aniosMin)} o más`;
  }
  return `Experiencia ${aniosMin} a ${aniosMax} ${pluralizarAnios(aniosMax)}`;
}

function pluralizarAnios(cantidad: number): string {
  return cantidad === 1 ? "año" : "años";
}
