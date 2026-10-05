import { apiClient } from "@/api/client";
import { rutaTenant } from "@/shared/tenant/tenantPaths";


export async function fetchTenantNombre(id: string): Promise<string> {
  const { data } = await apiClient.get<{ nombreComercial: string }>(
    `${rutaTenant(id)}/publico/nombre`,
    { skipTenantInterceptor: true },
  );
  return data.nombreComercial;
}
