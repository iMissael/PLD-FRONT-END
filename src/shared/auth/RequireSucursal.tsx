import { Navigate, Outlet, useParams } from "react-router-dom";

import { useSucursalActivaStore } from "@/shared/auth/sucursalActivaStore";
import { rutaTenant } from "@/shared/tenant/tenantPaths";

/** Exige haber elegido sucursal tras iniciar sesión. */
export function RequireSucursal() {
  const { tenantId = "" } = useParams<{ tenantId: string }>();
  const sucursalActiva = useSucursalActivaStore((estado) => estado.sucursalActiva);

  if (!sucursalActiva) {
    return <Navigate to={rutaTenant(tenantId, "seleccionar-sucursal")} replace />;
  }

  return <Outlet />;
}
