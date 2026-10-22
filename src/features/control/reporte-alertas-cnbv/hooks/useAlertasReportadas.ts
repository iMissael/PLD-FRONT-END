import { useQuery } from "@tanstack/react-query";

import { listarAlertas } from "@/features/alertas/api/alertasApi";
import { alertasKeys } from "@/features/alertas/hooks/useAlertas";
import type { Alerta } from "@/features/alertas/types/alertas";

/** El backend devuelve como máximo 50 por página. */
const TAMANIO_PAGINA = 50;

/**
 * Alertas del tipo que ya se confirmaron en "Revisión de alertas": al confirmar una alerta de un tipo
 * que va a la CNBV (I, IP, R) el backend la deja REPORTADA, que es lo que se reporta desde aquí.
 */
async function listarReportadas(alertaAcronimo: string): Promise<Alerta[]> {
  const alertas: Alerta[] = [];
  for (let pagina = 0; ; pagina++) {
    const resultado = await listarAlertas({ alertaAcronimo, estatus: "REPORTADA" }, pagina, TAMANIO_PAGINA);
    alertas.push(...resultado.contenido);
    if (pagina + 1 >= resultado.totalPaginas || resultado.contenido.length === 0) return alertas;
  }
}

export function useAlertasReportadas(alertaAcronimo: string) {
  return useQuery({
    queryKey: [...alertasKeys.all, "reportadas", alertaAcronimo],
    queryFn: () => listarReportadas(alertaAcronimo),
  });
}
