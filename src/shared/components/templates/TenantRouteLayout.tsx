import { Suspense } from "react";
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

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
            <span className="text-sm">Cargando...</span>
          </div>
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
}
