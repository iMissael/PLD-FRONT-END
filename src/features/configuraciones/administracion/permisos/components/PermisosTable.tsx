import { useState } from "react";
import { toast } from "sonner";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Badge } from "@/shared/components/atoms/Badge";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { TablePagination } from "@/shared/components/molecules/TablePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/atoms/Table";
import {
  useEliminarPermiso,
  usePermisos,
} from "@/features/configuraciones/administracion/permisos/hooks/usePermisos";
import { esEstatusActivo, etiquetaEstatus } from "@/shared/utils/estatus";

/**
 * La paginación es del backend (PermisoJpaAdapter), igual que los demás catálogos: cada página se
 * pide a demanda, no se trae todo el catálogo para cortarlo aquí. Crear varios permisos de golpe
 * (PermisoForm, un alta por menú×acción) ya no vuelve inmanejable esta tabla.
 */
export function PermisosTable() {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(20);
  const { data, isLoading, isError } = usePermisos(
    busqueda ? { busqueda } : {},
    pagina,
    tamanio,
  );
  const eliminarPermiso = useEliminarPermiso();

  const listaPermisos = data?.contenido ?? [];

  return (
    <div className="space-y-3">
      <Input
        aria-label="Buscar por recurso o descripción"
        placeholder="Buscar por recurso o descripción"
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.target.value);
          setPagina(0);
        }}
        className="max-w-sm"
      />

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando permisos…</p>
      ) : isError ? (
        <p className="text-destructive text-sm">No se pudieron cargar los permisos.</p>
      ) : listaPermisos.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {busqueda ? "No hay permisos con esa búsqueda." : "Aún no hay permisos."}
        </p>
      ) : (
        <>
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

          <TablePagination
            count={data?.totalElementos ?? 0}
            page={pagina}
            rowsPerPage={tamanio}
            onPageChange={(_, nuevaPagina) => setPagina(nuevaPagina)}
            onRowsPerPageChange={(e) => {
              setTamanio(Number(e.target.value));
              setPagina(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </>
      )}
    </div>
  );
}
