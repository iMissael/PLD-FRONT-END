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
export const card = "rounded-lg border border-border bg-card";

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
  root: "min-w-full divide-y divide-border text-sm",
  head: "bg-muted",
  headCell: "px-3 py-2 text-left font-medium text-muted-foreground",
  body: "divide-y divide-border",
  /** Fila clicable. `seleccionada` la resalta con un tinte del acento. */
  row: (seleccionada: boolean) =>
    seleccionada ? "cursor-pointer bg-primary/10" : "cursor-pointer hover:bg-muted",
  cell: "px-3 py-2 text-foreground",
  cellMuted: "px-3 py-2 text-muted-foreground",
  cellStrong: "px-3 py-2 font-medium text-foreground",
};

/** Mensaje de estado vacío o de carga, dentro de un panel. */
export const emptyState = `${card} p-6 text-center text-sm text-muted-foreground`;
