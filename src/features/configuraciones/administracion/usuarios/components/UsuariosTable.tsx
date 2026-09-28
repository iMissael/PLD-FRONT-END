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
  useEliminarUsuario,
  useUsuarios,
} from "@/features/configuraciones/administracion/usuarios/hooks/useUsuarios";

export function UsuariosTable() {
  const { data: usuarios, isLoading, isError } = useUsuarios();
  const eliminarUsuario = useEliminarUsuario();

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando usuarios…</p>;
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">No se pudieron cargar los usuarios.</p>
    );
  }

  if (!usuarios || usuarios.length === 0) {
    return <p className="text-muted-foreground text-sm">Aún no hay usuarios.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((usuario) => (
          <TableRow key={usuario.idUsuario}>
            <TableCell className="font-medium">{usuario.username}</TableCell>
            <TableCell>{usuario.nombre}</TableCell>
            <TableCell>{usuario.correo ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={usuario.estado === "ACTIVO" ? "default" : "secondary"}>
                {usuario.estado}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                disabled={eliminarUsuario.isPending}
                onClick={() => {
                  if (usuario.idUsuario) {
                    eliminarUsuario.mutate(usuario.idUsuario);
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
