import { useQuery } from "@tanstack/react-query";

import { obtenerDashboardAlertas } from "../api/dashboardAlertasApi";

export function useDashboardAlertas() {
  return useQuery({
    queryKey: ["dashboard-alertas"],
    queryFn: obtenerDashboardAlertas,
  });
}
