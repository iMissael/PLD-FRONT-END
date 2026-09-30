import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { TablePagination } from "@/shared/components/TablePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  useEliminarRol,
  useRoles,
} from "@/features/configuraciones/administracion/roles/hooks/useRoles";

export function RolesTable() {
  const rutaEnTenant = useRutaTenant();
  const { data: roles, isLoading, isError } = useRoles();
  const eliminarRol = useEliminarRol();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const listaRoles = useMemo(() => {
    if (!roles) return [];
    if (Array.isArray(roles)) return roles;
    if (Array.isArray((roles as unknown as { contenido?: typeof roles })?.contenido)) {
      return (roles as unknown as { contenido: typeof roles }).contenido ?? [];
    }
    return [];
  }, [roles]);

  const totalElements = listaRoles.length;
  const paginatedRoles = useMemo(() => {
    const start = page * rowsPerPage;
    return listaRoles.slice(start, start + rowsPerPage);
  }, [listaRoles, page, rowsPerPage]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando roles…</p>;
  }

  if (isError) {
    return <p className="text-destructive text-sm">No se pudieron cargar los roles.</p>;
  }

  if (!roles || roles.length === 0) {
    return <p className="text-muted-foreground text-sm">Aún no hay roles.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRoles.map((rol) => (
            <TableRow key={rol.idRol}>
              <TableCell className="font-medium">{rol.nombre}</TableCell>
              <TableCell>{rol.categoria}</TableCell>
              <TableCell>{rol.descripcion ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={rol.estado === "ACTIVO" ? "default" : "secondary"}>
                  {rol.estado}
                </Badge>
              </TableCell>
              <TableCell className="space-x-2 text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to={rutaEnTenant(
                      `configuraciones/administracion/roles/${rol.idRol}/permisos`,
                    )}
                  >
                    Permisos
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={eliminarRol.isPending}
                  onClick={() => {
                    if (rol.idRol) {
                      eliminarRol.mutate(rol.idRol);
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

      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </div>
  );
}
