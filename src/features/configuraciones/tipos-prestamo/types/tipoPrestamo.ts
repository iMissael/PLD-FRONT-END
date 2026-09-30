/**
 * Tipos del catálogo de Tipos de Préstamo (`CatTipoPrestamoController`).
 *
 * Por ahora este feature es **solo de lectura**: existe para alimentar el
 * `TipoPrestamoSelect` que usa Tipos de crédito. La pantalla de gestión, con
 * sus ~19 campos y los dos JSON (`documentacion`, `configuracionJson`), está
 * pendiente; cuando se haga, aquí se agregan los tipos que falten.
 */

/** Valores del enum `Estatus` del backend. */
export type EstatusTipoPrestamo = "A" | "B" | "S" | "E";

/**
 * Subconjunto de `CatTipoPrestamoResponse`: solo lo que necesita el select.
 * El backend devuelve más campos; declarar solo estos es deliberado.
 */
export interface TipoPrestamoResponse {
  id: string;
  nombre: string;
  estatus: EstatusTipoPrestamo;
}
