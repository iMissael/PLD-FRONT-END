export type EstatusAutorizacion = "AUTORIZADO" | "RECHAZADO" | "CANCELADO";

export const ESTATUS_AUTORIZACION: { valor: EstatusAutorizacion; etiqueta: string }[] = [
  { valor: "AUTORIZADO", etiqueta: "Autorizados" },
  { valor: "RECHAZADO", etiqueta: "Rechazados" },
  { valor: "CANCELADO", etiqueta: "Cancelados" },
];

export interface FiltroAutorizaciones {
  desde?: string;
  hasta?: string;
  estatus: EstatusAutorizacion[];
}

export interface AcreditadoAutorizacion {
  numero: string | null;
  referencia: string | null;
  nombre: string | null;
  rfc: string | null;
  curp: string | null;
}

export interface EmpleadoAutorizacion {
  fecha: string | null;
  usuario: string | null;
  nombreEmpleado: string | null;
}

export interface MovimientoAutorizacion {
  tipoMovimiento: string | null;
  referenciaCredito: string | null;
  importe: number | null;
  moneda: string | null;
  formaPago: string | null;
}

export interface PaginaAutorizaciones {
  contenido: RevisionAutorizacion[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface RevisionAutorizacion {
  id: number;
  folioAlerta: number;
  folioOperacion: string;
  estatus: EstatusAutorizacion;
  acreditado: AcreditadoAutorizacion;
  solicitud: EmpleadoAutorizacion;
  autorizacion: EmpleadoAutorizacion;
  movimiento: MovimientoAutorizacion | null;
  descripcionAlerta: string | null;
}
