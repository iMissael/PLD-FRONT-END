/**
 * Reglas de alerta (`pld_configuracion_alerta`), contra `ConfiguracionAlertaRequest` /
 * `ConfiguracionAlertaResponse` de `denuncias-app`. Las reglas automáticas son las que
 * evalúa cada movimiento de cajas (`POST /v1/pld/operaciones/evaluar`).
 *
 * Tres campos guardan listas con el formato heredado de Sicanet (ver `utils/formatoSicanet.ts`):
 * - tipoPersona: "['F', 'FA', 'M']"
 * - formaPago: "['E']" (solo efectivo) o "['.']" (cualquiera)
 * - equivalenteMonedaAcronimo: JSON {"permitido":[{"moneda_acronimo":"MXN"}],"no_permitido":[...]}
 */

export type EstadoRegla = "ACTIVO" | "INACTIVO";

/** F física, FA física con actividad empresarial, M moral. */
export type TipoPersonaRegla = "F" | "FA" | "M";

/** Acrónimos de `cat_forma_pago`: E efectivo, T transferencia, * otras. "." = cualquiera. */
export type FormaPagoRegla = "E" | "T" | "*" | ".";

export type Moneda = "MXN" | "USD";

/** C cliente, E entidad, A ambos. */
export type AplicaRegla = "C" | "E" | "A";

export interface ReglaAlerta {
  idConfiguracionAlerta: string;
  alertaAcronimo: string;
  tipoAlertaDescripcion: string | null;
  descripcion: string;
  /** 0 = sin razón. */
  fkPldCatRazonAlerta: number;
  razonAlertaNumero: string | null;
  razonAlertaDescripcion: string | null;
  importe: number;
  importeMonedaAcronimo: string;
  equivalenteMonedaAcronimo: string | null;
  tipoPersona: string;
  formaPago: string;
  /** S = suma varias operaciones (fraccionadas); N = una sola operación. */
  acumulado: "S" | "N";
  /** S = la genera el sistema; N = manual. */
  automatica: "S" | "N";
  aplica: AplicaRegla;
  estado: EstadoRegla;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface GuardarReglaInput {
  alertaAcronimo: string;
  descripcion: string;
  fkPldCatRazonAlerta: number;
  importe: number;
  importeMonedaAcronimo: string;
  equivalenteMonedaAcronimo: string;
  tipoPersona: string;
  formaPago: string;
  acumulado: "S" | "N";
  automatica: "S" | "N";
  aplica: AplicaRegla;
  estado: EstadoRegla;
}

export interface FiltroReglas {
  busqueda?: string;
  alertaAcronimo?: string;
  estado?: EstadoRegla;
}

export interface PaginaReglas {
  contenido: ReglaAlerta[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}
