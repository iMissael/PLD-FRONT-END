import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  recurso?: string;
  accion?: string;
}

export function ProtectedRoute({ children, recurso, accion }: ProtectedRouteProps) {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { isAuthenticated, hasPermission } = useAuth();

  const loginPath = `/SICANETSC/PLD/${tenantId ?? "57b37f52-ecd6-483d-addb-1495e96e2492"}/login`;

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  if (recurso && accion && !hasPermission(recurso, accion)) {
    return (
      <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Acceso Denegado</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          No tienes permisos suficientes ({recurso}:{accion}) para ver esta sección.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
