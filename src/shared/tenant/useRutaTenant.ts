import { useCallback } from "react";
import { useParams } from "react-router-dom";

import { rutaTenant } from "@/shared/tenant/tenantPaths";

export function useRutaTenant() {
  const { tenantId = "" } = useParams<{ tenantId: string }>();
  return useCallback((subruta = "") => rutaTenant(tenantId, subruta), [tenantId]);
}
