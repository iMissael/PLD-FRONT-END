export type EstatusAlerta = "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "REPORTADA";

export type EstatusAlertaRevision = EstatusAlerta | "VENCIDA";

export type OrigenAlerta = "MANUAL" | "AUTOMATICA";

export type TipoReportado = "SOCIO" | "EMPLEADO";

export interface TipoAlerta {
  idTipoAlerta: number;
  alertaAcronimo: string;
  descripcion: string;
  limiteDictamenDias: number | null;
  envioReporteDias: number | null;
  mesesEnvioAlerta: string | null;
  buzon: string | null;
  estado: "ACTIVO" | "INACTIVO";
  tipoReportado: TipoReportado | null;
}

export interface RazonAlerta {
  idRazonAlerta: number;
  alertaAcronimo: string;
  numeroRazonAlerta: string | null;
  descripcionRazonAlerta: string;
  es24Horas: string | null;
  estado: "ACTIVO" | "INACTIVO";
}

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

export interface Alerta {
  id: number;
  folio: number;
  origen: OrigenAlerta;
  alertaAcronimo: string;
  tipoAlertaDescripcion: string;
  razonAlertaId: number | null;
  razonAlertaNumero: string | null;
  razonAlertaDescripcion: string | null;
  fechaAlerta: string;
  fechaIncidencia: string;
  descripcion: string | null;
  actoHecho: string | null;
  informacionAdicional: string | null;
  folioOperacion: string | null;
  referenciaCredito: string | null;
  denunciaId: number | null;
  estatus: EstatusAlerta;
  usuarioCapturaId: string | null;
  reportado: ReportadoAlerta | null;
  analisisContexto: string | null;
  determinacionInusualidad: string | null;
  analisisAlerta: string | null;
  gestiones: string | null;
  seReporta: boolean;
  fechaDictamen: string | null;
  updatedAt: string;
  fechaLimiteDictamen: string | null;
  diasRestantes: number | null;
  fechaLimiteReporte: string | null;
  diasHabilesRestantesReporte: number | null;
}

export const RECUADROS_ANALISIS = [
  { campo: "analisisContexto", titulo: "Análisis del contexto" },
  { campo: "determinacionInusualidad", titulo: "Determinación de la inusualidad" },
  { campo: "analisisAlerta", titulo: "Análisis de la alerta" },
  { campo: "gestiones", titulo: "Gestiones" },
] as const;

export type CampoAnalisis = (typeof RECUADROS_ANALISIS)[number]["campo"];

export interface ExpedienteAlerta {
  evaluado: {
    tipoReportado: TipoReportado;
    referencia: string;
    nombre: string;
    rfc: string | null;
    curp: string | null;
    domicilio: string | null;
    puesto: string | null;
  } | null;
  perfilTransaccional: PerfilTransaccional | null;
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
  acreditadoReferencia: string;
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

export interface CrearAlertaManualInput {
  alertaAcronimo: string;
  razonAlertaId?: number;
  tipoReportado: TipoReportado;
  referenciaReportado: string;
  fechaIncidencia: string;
  actoHecho: string;
  informacionAdicional?: string;
  fechaEmisionFuente?: string;
  fuenteInformacion?: string;
  estatusReportado?: string;
}

export interface FiltroAlertas {
  alertaAcronimo?: string;
  estatus?: EstatusAlerta;
  origen?: OrigenAlerta;
  persona?: string;
  desde?: string;
  hasta?: string;
  tiposEstatus?: Record<string, EstatusAlertaRevision[]>;
}

export interface PaginaAlertas {
  contenido: Alerta[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface MovimientoAlerta {
  folioOperacion: string | null;
  fecha: string | null;
  tipoMovimiento: string | null;
  importe: number | null;
  moneda: string | null;
  formaPago: string | null;
}

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

export interface PaginaEmpleados {
  contenido: EmpleadoExterno[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}

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

export function estatusDe(alerta: Pick<Alerta, "estatus">): EstatusAlertaRevision {
  const estatus = alerta.estatus as EstatusAlertaRevision;
  if (estatus === "REPORTADA") return "CONFIRMADA";
  if (estatus === "VENCIDA") return "PENDIENTE";
  return estatus;
}
