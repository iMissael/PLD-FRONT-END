import { useQuery } from "@tanstack/react-query";

import { listarAlertasPorReportar, type TipoReporteCnbv } from "../api/reporteCnbvApi";

export const reporteCnbvKeys = {
  all: ["reporte-cnbv"] as const,
  porReportar: (tipo: TipoReporteCnbv) =>
    [...reporteCnbvKeys.all, "por-reportar", tipo] as const,
};

export function useAlertasPorReportar(tipo: TipoReporteCnbv) {
  return useQuery({
    queryKey: reporteCnbvKeys.porReportar(tipo),
    queryFn: () => listarAlertasPorReportar(tipo === "R" ? "I" : tipo),
    enabled: tipo !== "R",
  });
}
