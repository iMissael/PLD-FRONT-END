/**
 * Clases compartidas de la UI, derivadas de los tokens de `src/index.css`
 * (fuente de verdad: `estilos/paleta_colores.md`).
 *
 * Existe para que los componentes no repitan cadenas de color: si la guía
 * cambia, se toca el token en el CSS o esta constante, no 43 archivos. Aquí
 * solo van patrones puramente visuales; lo que además tiene comportamiento
 * (botones, alertas) es un componente en esta misma carpeta.
 */

/** Panel/card: el contenedor blanco con borde que envuelve tablas y formularios. */
export const card = "rounded-lg border border-line bg-panel";

/** Campo de texto y `<select>`: misma caja para que se vean iguales. */
export const field =
  "rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg " +
  "focus:border-accent focus:ring-2 focus:ring-accent-ring focus:outline-none " +
  "disabled:bg-hover disabled:text-muted";

/** Etiqueta de un campo. */
export const label = "text-sm font-medium text-fg";

/** Texto de apoyo debajo de un campo. */
export const hint = "text-xs text-muted";

export const table = {
  /** Contenedor con el borde redondeado; la tabla va dentro. */
  wrapper: `overflow-hidden ${card}`,
  root: "min-w-full divide-y divide-line text-sm",
  head: "bg-hover",
  headCell: "px-3 py-2 text-left font-medium text-muted",
  body: "divide-y divide-line",
  /** Fila clicable. `seleccionada` la resalta con un tinte del acento. */
  row: (seleccionada: boolean) =>
    seleccionada
      ? "cursor-pointer bg-accent/10"
      : "cursor-pointer hover:bg-hover",
  cell: "px-3 py-2 text-fg",
  cellMuted: "px-3 py-2 text-muted",
  cellStrong: "px-3 py-2 font-medium text-fg",
};

/** Mensaje de estado vacío o de carga, dentro de un panel. */
export const emptyState = `${card} p-6 text-center text-sm text-muted`;
