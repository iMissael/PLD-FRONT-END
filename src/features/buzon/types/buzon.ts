export type EstadoDenuncia = "R" | "V" | "A" | "D";
export type EstatusAlerta = "A" | "B" | "S" | "E";

export interface ObservacionDenuncia {
  id: number;
  denunciaId: number;
  observacion: string;
  verificoRef?: string;
  createdAt: string;
}

export interface EvidenciaDenuncia {
  id: number;
  path?: string;
  denunciaId: number;
  nombre: string;
  tipoArchivo: string;
  createdAt: string;
}

export interface Denuncia {
  id: number;
  fechaIncidente: string;
  catRazonAlertaId: number;
  catTipoAlertaId: number;
  descripcion: string;
  estado: EstadoDenuncia;
  nombreDenunciado?: string;
  denunciadoCoincidenciaRef?: string;
  denunciadoVerificadoRef?: string;
  verificadoPor?: string;
  observaciones?: ObservacionDenuncia[];
  evidencias?: EvidenciaDenuncia[];
  createdAt: string;
  updatedAt: string;
}

export interface AlertaPLD {
  id: number;
  descripcion: string;
  catRazonAlertaId: number;
  importe: number;
  importeMonedaAcronimo?: string;
  equivalenteMonedaAcronimo?: string;
  tipoPersonaId?: string;
  formaPago?: string;
  acumulado?: string;
  automatica?: string;
  aplica?: string;
  estatus: EstatusAlerta;
  createdAt: string;
  updatedAt?: string;
}

export interface CrearDenunciaInput {
  fechaIncidente: string;
  catRazonAlertaId: number;
  catTipoAlertaId: number;
  descripcion: string;
  nombreDenunciado?: string;
}

export interface EditarDenunciaInput {
  catRazonAlertaId: number;
  denunciadoVerificadoRef?: string;
  observaciones?: string;
}

export interface CambiarEstatusInput {
  nuevoEstatus: EstadoDenuncia;
}

export interface AgregarObservacionInput {
  observacion: string;
  verificoRef?: string;
}

export interface ListarDenunciasParams {
  estado?: EstadoDenuncia;
  catTipoAlertaId?: number;
  catRazonAlertaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  size?: number;
}

export interface ListarAlertasParams {
  estatus?: EstatusAlerta;
  catRazonAlertaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
