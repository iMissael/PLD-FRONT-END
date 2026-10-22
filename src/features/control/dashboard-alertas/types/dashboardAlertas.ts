/** `TarjetaDashboardAlertasResponse`. */
export interface ConteoDashboard {
  etiqueta: string;
  cantidad: number;
}

/** Una tarjeta de "Control › Dashboard de alertas": total y desglose de un tipo de alerta. */
export interface TarjetaDashboardAlertas {
  acronimo: string;
  descripcion: string;
  total: number;
  /** Vacío para los tipos sin desglose (Seguimiento, igual que en Sicanet). */
  desglose: ConteoDashboard[];
}
