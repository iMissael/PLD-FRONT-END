import { apiClient } from "@/api/client";

export async function fetchTenantNombre(id: string): Promise<string> {
  const { data } = await apiClient.get<{ nombreComercial: string }>("/publico/nombre", {
    skipTenantInterceptor: true,
    headers: { "X-Tenant-Id": id },
  });
  return data.nombreComercial;
}
