/**
 * Tipos del feature `monto-credito` (menú: "Configuración de monto de
 * crédito"), a partir de `CatPrestamoMontoController` en `denuncias-app`.
 *
 * Ojo con el nombre del endpoint: es `/catalogos/prestamos-monto`, mientras la
 * tabla es `cat_prestamo_monto` y el menú dice "monto de crédito".
 */

/**
 * Valores del enum `Estatus` del backend. El formulario solo ofrece A y B.
 */
export type EstatusPrestamoMonto = "A" | "B" | "S" | "E";

/**
 * Igual a `CrearCatPrestamoMontoRequest`.
 *
 * Sin `id`: lo genera el adaptador como consecutivo. `nombre` no lo captura el
 * usuario — se deriva del rango con `generarNombreMonto`. `montoMax` en null
 * es un rango sin límite superior (la columna es nullable).
 *
 * Los montos viajan como `number`: el backend los recibe en `BigDecimal` con
 * `numeric(15,2)`, y el formulario los limita a dos decimales.
 */
export interface CrearPrestamoMontoInput {
  nombre: string;
  montoMin: number;
  montoMax: number | null;
  catNivelRiesgoId: number;
  estatus: EstatusPrestamoMonto;
}

/** Igual a `ActualizarCatPrestamoMontoRequest` (mismo shape que Crear). */
export type ActualizarPrestamoMontoInput = CrearPrestamoMontoInput;

/** Igual a `CatPrestamoMontoResponse`. */
export interface PrestamoMontoResponse {
  id: string;
  nombre: string;
  montoMin: number;
  /** Null = sin límite superior. */
  montoMax: number | null;
  catNivelRiesgoId: number;
  estatus: EstatusPrestamoMonto;
  createdAt: string;
  updatedAt: string;
}
