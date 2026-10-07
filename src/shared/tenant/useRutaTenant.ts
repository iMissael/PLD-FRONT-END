import { useCallback } from "react";
import { useParams } from "react-router-dom";

import { rutaTenant } from "@/shared/tenant/tenantPaths";
import { getCurrentTenantId } from "@/shared/tenant/tenantStore";

function getTenantIdFromPath(): string {
  if (typeof window === "undefined") return "";
  const match = window.location.pathname.match(/\/SICANETSC\/PLD\/([^/]+)/i);
  return match && match[1] ? match[1] : "";
}

export function useRutaTenant() {
  const { tenantId = "" } = useParams<{ tenantId: string }>();
  const resolvedTenantId = tenantId || getCurrentTenantId() || getTenantIdFromPath() || "";
  return useCallback(
    (subruta = "") => rutaTenant(resolvedTenantId, subruta),
    [resolvedTenantId],
  );
}
