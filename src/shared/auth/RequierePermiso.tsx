import type { ReactNode } from "react";

import { useAuthStore } from "@/shared/auth/authStore";

/** Exige un permiso puntual (recurso+acción) para ver el contenido; el administrador siempre pasa. */
export function RequierePermiso({
  recurso,
  accion,
  children,
}: {
  recurso: string;
  accion: string;
  children: ReactNode;
}) {
  const autorizado = useAuthStore((estado) => estado.hasPermission(recurso, accion));

  if (!autorizado) {
    return (
      <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-bold text-destructive">Acceso denegado</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          No tienes permisos suficientes ({recurso}:{accion}) para ver esta sección.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
