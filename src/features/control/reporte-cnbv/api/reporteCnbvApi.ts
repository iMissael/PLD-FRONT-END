import { apiClient } from "@/api/client";
import type { Alerta } from "@/features/alertas/types/alertas";

export type TipoReporteCnbv = "IP" | "I" | "R";

export async function listarAlertasPorReportar(
  tipo: Exclude<TipoReporteCnbv, "R">,
): Promise<Alerta[]> {
  const { data } = await apiClient.get<Alerta[]>("/reportes-cnbv/alertas", {
    params: { tipo },
  });
  return data;
}
