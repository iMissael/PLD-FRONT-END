import { useQuery } from "@tanstack/react-query";

import {
  listarAlertasPorReportar,
  obtenerPrevisualizacionReporteCnbv,
  type TipoReporteCnbv,
} from "../api/reporteCnbvApi";

export const reporteCnbvKeys = {
  all: ["reporte-cnbv"] as const,
  porReportar: (tipo: TipoReporteCnbv) =>
    [...reporteCnbvKeys.all, "por-reportar", tipo] as const,
  previsualizacion: (alertaId: number) =>
    [...reporteCnbvKeys.all, "previsualizacion", alertaId] as const,
};

export function useAlertasPorReportar(tipo: TipoReporteCnbv) {
  return useQuery({
    queryKey: reporteCnbvKeys.porReportar(tipo),
    queryFn: () => listarAlertasPorReportar(tipo === "R" ? "I" : tipo),
    enabled: tipo !== "R",
  });
}

/** "Previsualización de información de reporte CNBV": las 36 columnas de la alerta elegida. */
export function usePrevisualizacionReporteCnbv(alertaId: number | null) {
  return useQuery({
    queryKey: reporteCnbvKeys.previsualizacion(alertaId ?? 0),
    queryFn: () => obtenerPrevisualizacionReporteCnbv(alertaId as number),
    enabled: alertaId !== null,
  });
}
