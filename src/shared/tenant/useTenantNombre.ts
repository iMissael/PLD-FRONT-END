import { useQuery } from "@tanstack/react-query";
import { fetchTenantNombre } from "./tenantApi";

export function useTenantNombre(tenantId?: string) {
  return useQuery({
    queryKey: ["tenant-nombre", tenantId],
    queryFn: () => fetchTenantNombre(tenantId!),
    enabled: !!tenantId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}