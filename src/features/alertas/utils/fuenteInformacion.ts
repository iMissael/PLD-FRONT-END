export interface DatosFuenteInformacion {
  fechaEmisionFuente: string;
  fuenteInformacion: string;
  estatusReportado: string;
}

export const FUENTE_VACIA: DatosFuenteInformacion = {
  fechaEmisionFuente: "",
  fuenteInformacion: "",
  estatusReportado: "",
};
