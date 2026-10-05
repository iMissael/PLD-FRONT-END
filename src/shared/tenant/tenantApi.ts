import { apiClient } from "@/api/client";

/**
 * TenantController no vive bajo el prefijo /SICANETSC/PLD/:tenantId (ver
 * TenantPathPrefixConfig, en el backend): resuelve el tenant por el header
 * X-Tenant-Id, no por la URL. Aquí se manda explícito en vez de depender del
 * tenant de sesión (tenantInterceptor), porque esta llamada ocurre en login,
 * antes de que haya sesión, para el tenant de la URL (:tenantId).
 */
export async function fetchTenantNombre(id: string): Promise<string> {
  const { data } = await apiClient.get<{ nombreComercial: string }>("/publico/nombre", {
    skipTenantInterceptor: true,
    headers: { "X-Tenant-Id": id },
  });
  return data.nombreComercial;
}
