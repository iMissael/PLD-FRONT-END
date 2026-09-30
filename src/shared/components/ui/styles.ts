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
export const card = "rounded-xl border border-border bg-card shadow-xs";

/** Campo de texto y `<select>`: misma caja para que se vean iguales. */
export const field =
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground " +
  "focus:border-primary focus:ring-2 focus:ring-ring/50 focus:outline-none " +
  "disabled:bg-muted disabled:text-muted-foreground";

/** Etiqueta de un campo. */
export const label = "text-sm font-medium text-foreground";

/** Texto de apoyo debajo de un campo. */
export const hint = "text-xs text-muted-foreground";

export const table = {
  /** Contenedor con el borde redondeado; la tabla va dentro. */
  wrapper: `overflow-hidden ${card}`,
  root: "w-full text-left text-xs sm:text-sm",
  head: "border-b border-border bg-muted/50 text-muted-foreground",
  headCell: "px-4 py-3 text-left font-semibold text-muted-foreground",
  body: "divide-y divide-border",
  /** Fila clicable. `seleccionada` la resalta con un tinte del acento. */
  row: (seleccionada: boolean) =>
    seleccionada
      ? "cursor-pointer bg-primary/10 transition-colors select-none"
      : "cursor-pointer hover:bg-muted/40 transition-colors select-none",
  cell: "px-4 py-3 text-foreground",
  cellMuted: "px-4 py-3 text-muted-foreground",
  cellStrong: "px-4 py-3 font-semibold text-foreground",
};

/** Mensaje de estado vacío o de carga, dentro de un panel. */
export const emptyState = `${card} p-6 text-center text-sm text-muted-foreground`;
