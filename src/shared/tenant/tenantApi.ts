import { apiClient } from "@/api/client";

export async function fetchTenantNombre(id: string): Promise<string> {
  const { data } = await apiClient.get<{ nombreComercial: string }>(
    `/catalogos/tenants/publico/${id}/nombre`,
    { skipTenantInterceptor: true },
  );
  return data.nombreComercial;
}