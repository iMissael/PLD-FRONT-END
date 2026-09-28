import { useCallback } from "react";
import { useParams } from "react-router-dom";

import { rutaTenant } from "@/shared/tenant/tenantPaths";

/**
 * Devuelve una función que arma rutas del front dentro del tenant actual:
 * `rutaEnTenant("configuraciones/administracion/roles")`.
 */
export function useRutaTenant() {
  const { tenantId = "" } = useParams<{ tenantId: string }>();
  return useCallback((subruta = "") => rutaTenant(tenantId, subruta), [tenantId]);
}
