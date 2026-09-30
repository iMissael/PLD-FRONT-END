import { Search, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { TablePagination } from "@/shared/components/TablePagination";
import { useRoles } from "@/features/configuraciones/administracion/roles/hooks/useRoles";
import {
  useEliminarUsuario,
  useUsuarios,
} from "@/features/configuraciones/administracion/usuarios/hooks/useUsuarios";
import type { UsuarioResponse } from "@/features/configuraciones/administracion/usuarios/types/usuarios";

function inicialesDe(nombre: string | undefined, username: string | undefined) {
  const base = nombre?.trim() || username || "?";
  return base.charAt(0).toUpperCase();
}

function AvatarUsuario({ usuario }: { usuario: UsuarioResponse }) {
  return (
    <span className="from-primary-hover to-primary flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white">
      {inicialesDe(usuario.nombre, usuario.username)}
    </span>
  );
}

function BadgeEstado({ estado }: { estado: UsuarioResponse["estado"] }) {
  if (estado === "ACTIVO") return <Badge>Activo</Badge>;
  if (estado === "ELIMINADO") return <Badge variant="outline">Eliminado</Badge>;
  return <Badge variant="secondary">Inactivo</Badge>;
}

function FilaEsqueleto() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

function BotonEliminar({ usuario }: { usuario: UsuarioResponse }) {
  const eliminarUsuario = useEliminarUsuario();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label={`Eliminar a ${usuario.nombre ?? usuario.username}`}
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar a {usuario.nombre ?? usuario.username}?</AlertDialogTitle>
          <AlertDialogDescription>
            Su acceso quedará bloqueado de inmediato y se limpiarán sus permisos y
            domicilio asociados. Esta acción no se puede deshacer desde aquí.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive-hover"
            disabled={eliminarUsuario.isPending}
            onClick={() => {
              if (usuario.idUsuario) eliminarUsuario.mutate(usuario.idUsuario);
            }}
          >
            {eliminarUsuario.isPending ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function UsuariosTable() {
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: usuarios, isLoading, isError } = useUsuarios();
  const { data: roles } = useRoles();

  const listaRoles = useMemo(() => {
    if (!roles) return [];
    if (Array.isArray(roles)) return roles;
    if (Array.isArray((roles as unknown as { contenido?: typeof roles })?.contenido)) {
      return (roles as unknown as { contenido: typeof roles }).contenido ?? [];
    }
    return [];
  }, [roles]);

  const listaUsuarios = useMemo(() => {
    if (!usuarios) return [];
    if (Array.isArray(usuarios)) return usuarios;
    if (Array.isArray((usuarios as unknown as { contenido?: typeof usuarios })?.contenido)) {
      return (usuarios as unknown as { contenido: typeof usuarios }).contenido ?? [];
    }
    return [];
  }, [usuarios]);

  const nombreDeRol = useMemo(() => {
    const mapa = new Map<string, string>(
      listaRoles
        .filter((rol) => Boolean(rol.idRol))
        .map((rol) => [String(rol.idRol), String(rol.nombre ?? "—")]),
    );
    return (rolId: string | undefined): string => (rolId ? (mapa.get(rolId) ?? "—") : "—");
  }, [listaRoles]);

  const usuariosFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return listaUsuarios;
    return listaUsuarios.filter((usuario) =>
      [usuario.nombre, usuario.username, usuario.correo]
        .filter(Boolean)
        .some((campo) => campo!.toLowerCase().includes(query)),
    );
  }, [listaUsuarios, busqueda]);

  const totalElements = usuariosFiltrados.length;
  const paginatedUsuarios = useMemo(() => {
    const start = page * rowsPerPage;
    return usuariosFiltrados.slice(start, start + rowsPerPage);
  }, [usuariosFiltrados, page, rowsPerPage]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (isError) {
    return (
      <p className="text-destructive rounded-lg border border-dashed p-6 text-center text-sm">
        No se pudieron cargar los usuarios.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={busqueda}
          onChange={(event) => {
            setBusqueda(event.target.value);
            setPage(0);
          }}
          placeholder="Buscar por nombre, usuario o correo…"
          className="pl-8"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Usuario</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => <FilaEsqueleto key={i} />)}

            {!isLoading && paginatedUsuarios.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <Users className="size-8 opacity-40" />
                    <span className="text-sm">
                      {busqueda
                        ? "Ningún usuario coincide con esa búsqueda."
                        : "Aún no hay usuarios registrados."}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              paginatedUsuarios.map((usuario) => (
                <TableRow key={usuario.idUsuario}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AvatarUsuario usuario={usuario} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {usuario.nombre ?? usuario.username}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          @{usuario.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {usuario.correo ?? "—"}
                  </TableCell>
                  <TableCell>{nombreDeRol(usuario.rolId)}</TableCell>
                  <TableCell>
                    <BadgeEstado estado={usuario.estado} />
                  </TableCell>
                  <TableCell className="text-right">
                    <BotonEliminar usuario={usuario} />
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
    </div>
  );
}
