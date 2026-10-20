/**
 * Tipos compartidos de alertas PLD, escritos contra los DTOs de `denuncias-app`
 * (`AlertaController`, `CatalogoAlertaController`, `ConfiguracionAlertaController`).
 * Los usan "Operación › Captura de alertas", "Operación › Revisión de alertas" y
 * "Configuración de alertas › Configuración de alertas".
 */

/** Estatus de una alerta (`EstatusAlerta` del backend). */
/** Las CANCELADAS (botón rojo) no llegan al front: el backend no las lista. */
export type EstatusAlerta = "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "REPORTADA";

/**
 * Estatus que se ven en "Revisión de alertas": además, VENCIDA (pendiente que pasó su plazo
 * de dictamen). Va aparte de EstatusAlerta para no tocar el buzón, que lo usa como llave.
 */
export type EstatusAlertaRevision = EstatusAlerta | "VENCIDA";

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
  referenciaCredito: string | null;
  /** Denuncia del buzón que originó la alerta; null en manuales y de caja. */
  denunciaId: number | null;
  estatus: EstatusAlerta;
  usuarioCapturaId: string | null;
  reportado: ReportadoAlerta | null;
  /** Recuadros del dictamen (opcionales); ya no se editan después de dictaminar. */
  analisisContexto: string | null;
  determinacionInusualidad: string | null;
  analisisAlerta: string | null;
  gestiones: string | null;
  /** El tipo se reporta a la CNBV (I, I24, IP, R): al confirmarla queda reportada. */
  seReporta: boolean;
  updatedAt: string;
  /** Último día para dictaminar (fecha de la alerta + plazo del tipo); null si el tipo no tiene plazo. */
  fechaLimiteDictamen: string | null;
  /** Días naturales que quedan (0 = vence hoy); solo en pendientes con plazo. */
  diasRestantes: number | null;
}

/** Los 4 recuadros del dictamen de Sicanet, en el orden de la pantalla. */
export const RECUADROS_ANALISIS = [
  { campo: "analisisContexto", titulo: "Análisis del contexto" },
  { campo: "determinacionInusualidad", titulo: "Determinación de la inusualidad" },
  { campo: "analisisAlerta", titulo: "Análisis de la alerta" },
  { campo: "gestiones", titulo: "Gestiones" },
] as const;

export type CampoAnalisis = (typeof RECUADROS_ANALISIS)[number]["campo"];

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
  perfilTransaccional: PerfilTransaccional | null;
  /** Mes de la fecha de la alerta. */
  resumenPeriodo: {
    desde: string;
    hasta: string;
    alertasEmitidas: number;
    operacionesRealizadas: number;
    importeAcumuladoMxn: number;
    importeAcumuladoUsd: number;
  };
}

export interface PerfilTransaccional {
  id: number;
  socioReferencia: string;
  fechaRegistro: string;
  disponibilidad: number;
  moneda: string;
  numeroOperacionesMes: number;
  periodicidad: string | null;
  formasPago: string[];
  naturalezaCredito: string | null;
  tipoCredito: string | null;
  actividadEconomica: string | null;
  destinoRecursos: string | null;
  observacionesEjecutivo: string | null;
  terceroBeneficiario: boolean;
  tercerosBeneficiarios: string | null;
  terceroAportaRecursos: boolean;
  tercerosAportanRecursos: string | null;
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

/** Filtros de `GET /alertas`; todos opcionales. */
export interface FiltroAlertas {
  alertaAcronimo?: string;
  estatus?: EstatusAlerta;
  origen?: OrigenAlerta;
  persona?: string;
  desde?: string;
  hasta?: string;
  /**
   * Acrónimo del tipo -> estatus a ver de ese tipo; lista vacía = todos sus estatus.
   * Se combinan con "o" (Inusual pendientes o Relevante confirmadas). Sin tipos = todos.
   */
  tiposEstatus?: Record<string, EstatusAlertaRevision[]>;
}

export interface PaginaAlertas {
  contenido: Alerta[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}

/** `AlertaController.DictamenRequest`: el dictamen es obligatorio; los recuadros, no. */
export type DictamenInput = {
  estatus: Extract<EstatusAlerta, "CONFIRMADA" | "RECHAZADA">;
} & Partial<Record<CampoAnalisis, string>>;

export type CriterioBusquedaEmpleado = "clave" | "nombre";

export interface BusquedaEmpleados {
  criterio: CriterioBusquedaEmpleado;
  valor: string;
  pagina: number;
  tamanio: number;
}

/** `GET /empleados/pagina`. */
export interface PaginaEmpleados {
  contenido: EmpleadoExterno[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
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

export const ETIQUETA_ESTATUS: Record<EstatusAlertaRevision, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  RECHAZADA: "Rechazada",
  REPORTADA: "Reportada",
  VENCIDA: "Vencida",
};

/** El backend puede mandar VENCIDA aunque Alerta.estatus se tipe con EstatusAlerta. */
export function estatusDe(alerta: Pick<Alerta, "estatus">): EstatusAlertaRevision {
  return alerta.estatus as EstatusAlertaRevision;
}
