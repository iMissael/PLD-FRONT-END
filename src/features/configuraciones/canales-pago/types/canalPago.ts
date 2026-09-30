/**
 * Tipos del feature `canales-pago` (menú: "Configuración de canales de pago"),
 * a partir de `CatCanalPagoController` en `denuncias-app`.
 *
 * La columna `descripcion` existió en la tabla pero nunca se usó (vacía en
 * todos los registros) y se retiró del esquema, del backend y de aquí.
 *
 * `clave` y `acronimo` sí existen en el contrato, pero esta pantalla no los
 * captura: al ser una actualización parcial, todo campo que viaje en null
 * conserva su valor actual en el backend, así que no se pierden.
 */

/** Valores del enum `Estatus` del backend. El formulario solo ofrece A y B. */
export type EstatusCanalPago = "A" | "B" | "S" | "E";

/**
 * Igual a `CrearCatCanalPagoRequest`. Sin `id`: lo genera el adaptador como
 * consecutivo. `clave` y `acronimo` se omiten a propósito.
 */
export interface CrearCanalPagoInput {
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusCanalPago;
}

/** Igual a `ActualizarCatCanalPagoRequest` (mismo shape que Crear). */
export type ActualizarCanalPagoInput = CrearCanalPagoInput;

/** Igual a `CatCanalPagoResponse`. */
export interface CanalPagoResponse {
  id: string;
  clave: string | null;
  nombre: string;
  acronimo: string | null;
  catNivelRiesgoId: number;
  estatus: EstatusCanalPago;
  createdAt: string;
  updatedAt: string;
}
