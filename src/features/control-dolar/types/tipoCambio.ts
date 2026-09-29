/**
 * Tipo de cambio peso-dólar ("Control Dólar", manual Sicanet 4.4.1), contra
 * `TipoCambioController` de `denuncias-app`. Lo descarga el backend de Banxico
 * (serie FIX) los días hábiles; si Banxico falla se captura a mano.
 */

export type OrigenTipoCambio = "BANXICO" | "MANUAL";

/** `TipoCambioDtos.TipoCambioResponse`. */
export interface TipoCambio {
  id: number;
  /** yyyy-MM-dd */
  fecha: string;
  moneda: string;
  /** Pesos por un dólar. */
  importe: number;
  origen: OrigenTipoCambio;
  estatus: string;
}

/** `TipoCambioDtos.TipoCambioManualRequest`. */
export interface TipoCambioManualInput {
  fecha: string;
  importe: number;
}

/** `TipoCambioDtos.SincronizacionResponse`. */
export interface Sincronizacion {
  desde: string;
  hasta: string;
  diasGuardados: number;
}
