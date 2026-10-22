import { apiClient } from "@/api/client";

import type { TarjetaDashboardAlertas } from "../types/dashboardAlertas";

export async function obtenerDashboardAlertas(): Promise<TarjetaDashboardAlertas[]> {
  const { data } = await apiClient.get<TarjetaDashboardAlertas[]>("/control/dashboard-alertas");
  return data;
}
