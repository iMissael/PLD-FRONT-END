import { Navigate, Outlet, useParams } from "react-router-dom";

import { setCurrentTenantId } from "@/shared/tenant/tenantStore";

/**
 * Layout de entrada para toda la app: lee `:tenantId` de la URL y lo publica
 * en el tenant store ANTES de renderizar cualquier página hija, para que
 * cualquier request de TanStack Query disparado por esas páginas ya tenga
 * el tenant correcto disponible para `tenantInterceptor.ts`.
 *
 * Se actualiza en el cuerpo del componente (no en un `useEffect`) porque el
 * valor tiene que estar listo antes del primer render de los hijos, no
 * después del primer commit.
 */
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
