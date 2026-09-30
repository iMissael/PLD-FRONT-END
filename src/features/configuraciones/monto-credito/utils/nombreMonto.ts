/**
 * Formato de moneda de la pantalla de montos. Se centraliza aquí porque lo
 * usan la tabla, el formulario y el generador de nombre: si los tres
 * formatearan por su cuenta, el nombre guardado podría no coincidir con lo
 * que muestra la tabla.
 */
const FORMATO_MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatearMonto(monto: number): string {
  return FORMATO_MXN.format(monto);
}

/**
 * Nombre derivado del rango, que es lo que se guarda en `nombre`.
 *
 * Los 5 registros sembrados usan etiquetas posicionales ("RANGO UNO"), que no
 * dicen nada de los montos. Esta convención los describe, así que los
 * registros viejos y los nuevos van a convivir con estilos distintos hasta
 * que alguien edite los viejos.
 */
export function generarNombreMonto(montoMin: number, montoMax: number | null): string {
  if (montoMax === null) {
    return `Más de ${formatearMonto(montoMin)}`;
  }
  return `De ${formatearMonto(montoMin)} a ${formatearMonto(montoMax)}`;
}

/** Rango para mostrar en la tabla. */
export function formatearRangoMonto(montoMin: number, montoMax: number | null): string {
  if (montoMax === null) {
    return `${formatearMonto(montoMin)} o más`;
  }
  return `${formatearMonto(montoMin)} – ${formatearMonto(montoMax)}`;
}
