import { Navigate, Outlet, useParams } from "react-router-dom";

import { setCurrentTenantId } from "@/shared/tenant/tenantStore";


export function TenantRouteLayout() {
  const { tenantId } = useParams<{ tenantId: string }>();

  if (!tenantId) {
    // No debería pasar: la ruta que usa este layout siempre declara
    // `:tenantId`. Si pasa, es un bug de configuración de rutas.
    return <Navigate to="/" replace />;
  }

  setCurrentTenantId(tenantId);

  return <Outlet />;
}
