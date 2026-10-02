/**
 * Tipos compartidos de alertas PLD, escritos contra los DTOs de `denuncias-app`
 * (`AlertaController`, `CatalogoAlertaController`, `ConfiguracionAlertaController`).
 * Los usan "Operación › Captura de alertas", "Operación › Revisión de alertas" y
 * "Configuración de alertas › Configuración de alertas".
 */

/** Estatus de una alerta (`EstatusAlerta` del backend). */
export type EstatusAlerta = "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "REPORTADA";

/** MANUAL = capturada por un usuario; AUTOMATICA = la generó una operación de cajas. */
export type OrigenAlerta = "MANUAL" | "AUTOMATICA";

/** A quién se reporta: cliente (socio) o empleado. */
export type TipoReportado = "SOCIO" | "EMPLEADO";

/** `CatalogoAlertaResponses.TipoAlertaResponse`. */
export interface TipoAlerta {
  idTipoAlerta: number;
  /** I, I24, R, IP, T, S, A. */
  alertaAcronimo: string;
  descripcion: string;
  limiteDictamenDias: number | null;
  envioReporteDias: number | null;
  mesesEnvioAlerta: string | null;
  buzon: string | null;
  estado: "ACTIVO" | "INACTIVO";
  /** null = el tipo solo lo genera el sistema (T, S, A): no se captura a mano. */
  tipoReportado: TipoReportado | null;
}

/** `CatalogoAlertaResponses.RazonAlertaResponse`. */
export interface RazonAlerta {
  idRazonAlerta: number;
  alertaAcronimo: string;
  numeroRazonAlerta: string | null;
  descripcionRazonAlerta: string;
  es24Horas: string | null;
  estado: "ACTIVO" | "INACTIVO";
}

/** `AlertaResponse.ReportadoResponse`. */
export interface ReportadoAlerta {
  tipoReportado: TipoReportado;
  referencia: string;
  nombre: string;
  rfc: string | null;
  puesto: string | null;
  fechaEmisionFuente: string | null;
  fuenteInformacion: string | null;
  estatusReportado: string | null;
}

/** `AlertaResponse`. */
export interface Alerta {
  id: number;
  folio: number;
  origen: OrigenAlerta;
  alertaAcronimo: string;
  tipoAlertaDescripcion: string;
  /** Las automáticas R/S/A no tienen razón. */
  razonAlertaId: number | null;
  razonAlertaNumero: string | null;
  razonAlertaDescripcion: string | null;
  /** Fecha de captura o generación ("Fecha Alerta" de la revisión). */
  fechaAlerta: string;
  fechaIncidencia: string;
  /** Texto generado por el sistema (automáticas). */
  descripcion: string | null;
  /** Captura manual. */
  actoHecho: string | null;
  informacionAdicional: string | null;
  folioOperacion: string | null;
  estatus: EstatusAlerta;
  usuarioCapturaId: string | null;
  reportado: ReportadoAlerta | null;
  updatedAt: string;
}

/** `ExpedienteAlertaResponse`: panel inferior de "Revisión de alertas". */
export interface ExpedienteAlerta {
  /** null si la alerta no tiene reportado. */
  evaluado: {
    tipoReportado: TipoReportado;
    referencia: string;
    nombre: string;
    rfc: string | null;
    /** Solo clientes; se consulta en vivo al servicio de socios. */
    curp: string | null;
    domicilio: string | null;
    puesto: string | null;
  } | null;
  /** Mes de la fecha de la alerta. */
  resumenPeriodo: {
    desde: string;
    hasta: string;
    alertasEmitidas: number;
  };
}

/** `CrearAlertaManualRequest`. */
export interface CrearAlertaManualInput {
  alertaAcronimo: string;
  /** Obligatoria si el tipo tiene razones en el catálogo (Inusual, Interna preocupante). */
  razonAlertaId?: number;
  tipoReportado: TipoReportado;
  referenciaReportado: string;
  /** yyyy-MM-dd */
  fechaIncidencia: string;
  actoHecho: string;
  informacionAdicional?: string;
  fechaEmisionFuente?: string;
  fuenteInformacion?: string;
  estatusReportado?: string;
}

/** Filtros de `GET /v1/pld/alertas`; todos opcionales. */
export interface FiltroAlertas {
  alertaAcronimo?: string;
  estatus?: EstatusAlerta;
  origen?: OrigenAlerta;
  persona?: string;
  desde?: string;
  hasta?: string;
}

/** `AlertaController.DictamenRequest`. */
export interface DictamenInput {
  estatus: Extract<EstatusAlerta, "CONFIRMADA" | "RECHAZADA">;
  justificacion: string;
}

/** Empleado del core externo (`EmpleadoExternoDTO`). */
export interface EmpleadoExterno {
  id: string;
  nombre: string;
  area?: string;
  rfc?: string;
  status?: string;
  sucursal?: string;
}

export const ETIQUETA_ESTATUS: Record<EstatusAlerta, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  RECHAZADA: "Rechazada",
  REPORTADA: "Reportada",
};
