export interface TipoAlertaBuzon {
  id: number;
  nombre: string;
  descripcion: string;
  limiteDictamenDias?: number;
  envioReporteDias?: number;
  mesesEnvioAlerta?: string;
  buzon: string;
  estatus: string;
}

export interface RazonAlerta {
  id: number;
  catTipoAlertaId: number;
  nombre: string;
  descripcionRazonAlerta: string;
  horas24?: string;
  estatus: string;
}
