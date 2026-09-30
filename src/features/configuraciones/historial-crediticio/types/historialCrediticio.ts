/**
 * Tipos del feature `historial-crediticio`, a partir de
 * `CatHistorialCrediticioController` en `denuncias-app`.
 *
 * Ojo con el nombre del endpoint: es `/catalogos/historias-crediticias`
 * ("historias"), mientras las clases del backend y la tabla dicen
 * "historial" (`CatHistorialCrediticio` / `cat_historial_crediticio`).
 *
 * Alcance confirmado: esta pantalla es solo consulta + cambio de nivel de
 * riesgo. El catálogo es cerrado por naturaleza — "con historial" y "sin
 * historial" agotan los casos — y `ConsultaAdapter` lo lee para puntuar la
 * matriz de riesgo, así que no se expone alta ni baja.
 */

/**
 * Valores del enum `Estatus` del backend. No se edita desde esta pantalla,
 * pero llega en la respuesta.
 */
export type EstatusHistorialCrediticio = "A" | "B" | "S" | "E";

/**
 * Subconjunto de `ActualizarCatHistorialCrediticioRequest`.
 *
 * El request del backend tiene `nombre`, `catNivelRiesgoId` y `estatus`, los
 * tres opcionales; el dominio conserva el valor actual de lo que llegue en
 * null. Por eso mandar solo el nivel es suficiente y no borra el nombre.
 */
export interface CambiarNivelRiesgoHistorialInput {
  catNivelRiesgoId: number;
}

/** Igual a `CatHistorialCrediticioResponse`. */
export interface HistorialCrediticioResponse {
  id: string;
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusHistorialCrediticio;
  createdAt: string;
  updatedAt: string;
}
