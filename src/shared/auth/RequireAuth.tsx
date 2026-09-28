import { Navigate, Outlet, useParams } from "react-router-dom";

import { useAuthStore } from "@/shared/auth/authStore";
import { rutaTenant } from "@/shared/tenant/tenantPaths";

/**
 * Deja pasar solo con una sesión iniciada en este mismo tenant. Si el token
 * es de otro tenant (o no hay), lleva al login del tenant de la URL.
 */
export function RequireAuth() {
  const { tenantId = "" } = useParams<{ tenantId: string }>();
  const autenticado = useAuthStore((estado) => estado.isAuthenticated(tenantId));

  if (!autenticado) {
    return <Navigate to={rutaTenant(tenantId, "login")} replace />;
  }

  return <Outlet />;
}
