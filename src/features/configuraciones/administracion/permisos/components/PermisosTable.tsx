import { useMemo } from "react";
import { toast } from "sonner";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  useEliminarPermiso,
  usePermisos,
} from "@/features/configuraciones/administracion/permisos/hooks/usePermisos";
import type { PermisoResponse } from "@/features/configuraciones/administracion/permisos/types/permisos";
import { esEstatusActivo, etiquetaEstatus } from "@/shared/utils/estatus";

export function PermisosTable() {
  const { data: permisos, isLoading, isError } = usePermisos();
  const eliminarPermiso = useEliminarPermiso();

  const listaPermisos: PermisoResponse[] = useMemo(() => {
    if (!permisos) return [];
    if (Array.isArray(permisos)) return permisos;
    if (Array.isArray((permisos as unknown as { contenido?: PermisoResponse[] })?.contenido)) {
      return (permisos as unknown as { contenido: PermisoResponse[] }).contenido ?? [];
    }
    return [];
  }, [permisos]);

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando permisos…</p>;
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">No se pudieron cargar los permisos.</p>
    );
  }

  if (listaPermisos.length === 0) {
    return <p className="text-muted-foreground text-sm">Aún no hay permisos.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Recurso</TableHead>
          <TableHead>Acción</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listaPermisos.map((permiso) => (
          <TableRow key={permiso.idPermiso}>
            <TableCell className="font-medium">{permiso.recurso}</TableCell>
            <TableCell>{permiso.accion}</TableCell>
            <TableCell>{permiso.descripcion ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={esEstatusActivo(permiso.estado) ? "default" : "secondary"}>
                {etiquetaEstatus(permiso.estado)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                disabled={eliminarPermiso.isPending}
                onClick={() => {
                  if (permiso.idPermiso) {
                    if (
                      !window.confirm(
                        `¿Está seguro de eliminar el permiso ${permiso.recurso}:${permiso.accion}?`,
                      )
                    ) {
                      return;
                    }
                    eliminarPermiso.mutate(permiso.idPermiso, {
                      onSuccess: () => {
                        toast.success("Permiso eliminado correctamente");
                      },
                      onError: (error) => {
                        toast.error(
                          isAppError(error) ? error.message : "No se pudo eliminar el permiso",
                        );
                      },
                    });
                  }
                }}
              >
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
