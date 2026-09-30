/**
 * Tipos del feature `tipos-credito` (menú: "Configuración de tipos de crédito"),
 * a partir de `CatTipoCreditoController` en `denuncias-app`.
 */

/** Valores del enum `Estatus` del backend. El formulario solo ofrece A y B. */
export type EstatusTipoCredito = "A" | "B" | "S" | "E";

/**
 * Igual a `CrearCatTipoCreditoRequest`. Sin `id`: lo genera el adaptador como
 * consecutivo.
 *
 * `catTipoPrestamoId` viaja como `""` cuando no hay tipo de préstamo asignado;
 * la columna es NOT NULL con default `''`, así que el vacío es un valor real y
 * no un null.
 */
export interface CrearTipoCreditoInput {
  nombre: string;
  catNivelRiesgoId: number;
  catTipoPrestamoId: string;
  estatus: EstatusTipoCredito;
}

/** Igual a `ActualizarCatTipoCreditoRequest` (mismo shape que Crear). */
export type ActualizarTipoCreditoInput = CrearTipoCreditoInput;

/** Igual a `CatTipoCreditoResponse`. */
export interface TipoCreditoResponse {
  id: string;
  nombre: string;
  catNivelRiesgoId: number;
  catTipoPrestamoId: string;
  estatus: EstatusTipoCredito;
  createdAt: string;
  updatedAt: string;
}
