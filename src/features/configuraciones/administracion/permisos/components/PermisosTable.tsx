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

export function PermisosTable() {
  const { data: permisos, isLoading, isError } = usePermisos();
  const eliminarPermiso = useEliminarPermiso();

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando permisos…</p>;
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">No se pudieron cargar los permisos.</p>
    );
  }

  if (!permisos || permisos.length === 0) {
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
        {permisos.map((permiso) => (
          <TableRow key={permiso.idPermiso}>
            <TableCell className="font-medium">{permiso.recurso}</TableCell>
            <TableCell>{permiso.accion}</TableCell>
            <TableCell>{permiso.descripcion ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={permiso.estado === "ACTIVO" ? "default" : "secondary"}>
                {permiso.estado}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                disabled={eliminarPermiso.isPending}
                onClick={() => {
                  if (permiso.idPermiso) {
                    eliminarPermiso.mutate(permiso.idPermiso);
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
