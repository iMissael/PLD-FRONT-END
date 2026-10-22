export interface ParametrosAlerta {
  toleranciaPerfilPorcentaje: number;
  aniosAtrasIncidencia: number;
}

export interface VentanaEnvio {
  mes: number;
  maximoDias: number;
}

export interface PlazosTipoAlerta {
  alertaAcronimo: string;
  descripcion: string;
  limiteDictamenDias: number;
  envioReporteDias: number;
  ventanasEnvio: VentanaEnvio[];
  editaDictamen: boolean;
  editaReporte: boolean;
  editaVentanas: boolean;
}

export interface GuardarPlazosInput {
  limiteDictamenDias?: number;
  envioReporteDias?: number;
  ventanasEnvio?: VentanaEnvio[];
}

export type OrigenDiaInhabil = "CNBV" | "MANUAL";

export interface DiaInhabil {
  id: number;
  fecha: string;
  descripcion: string;
  origen: OrigenDiaInhabil;
  activo: boolean;
}

export interface AgregarDiaInhabilInput {
  fecha: string;
  descripcion: string;
}
