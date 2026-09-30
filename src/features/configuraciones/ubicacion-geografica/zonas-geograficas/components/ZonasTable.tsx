import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { TablePagination } from "@/shared/components/TablePagination";
import { emptyState, table } from "@/shared/components/ui/styles";

import type { EntidadPais, ZonaGeograficaResponse } from "../types/zonaGeografica";

interface ZonasTableProps {
  zonas: ZonaGeograficaResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  verId: string | null;
  tipoFiltro?: EntidadPais;
  onSeleccionar: (zona: ZonaGeograficaResponse) => void;
  onVer: (zona: ZonaGeograficaResponse) => void;
  onDoubleClick?: (zona: ZonaGeograficaResponse) => void;
}

export function ZonasTable({
  zonas,
  isLoading,
  seleccionadaId,
  verId,
  tipoFiltro,
  onSeleccionar,
  onVer,
  onDoubleClick,
}: ZonasTableProps) {
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const zonasSegunTipo = useMemo(() => {
    if (!zonas) return [];
    if (!tipoFiltro) return zonas;

    if (tipoFiltro === "P") {
      return zonas.filter(
        (z) =>
          z.entidadPais === "P" ||
          (z.entidadPais === null && z.totalPaisesAsignados > 0) ||
          (z.entidadPais === null && z.totalEntidadesAsignadas === 0),
      );
    }

    if (tipoFiltro === "E") {
      return zonas.filter(
        (z) =>
          z.entidadPais === "E" ||
          (z.entidadPais === null && z.totalEntidadesAsignadas > 0),
      );
    }

    return zonas;
  }, [zonas, tipoFiltro]);

  const zonasFiltradas = useMemo(() => {
    if (!zonasSegunTipo) return [];
    if (!busqueda.trim()) return zonasSegunTipo;
    const term = busqueda.toLowerCase().trim();
    return zonasSegunTipo.filter(
      (z) =>
        z.nombre.toLowerCase().includes(term) ||
        z.nivelRiesgoDescripcion?.toLowerCase().includes(term) ||
        (z.estatus === "A" ? "activa" : "inactiva").includes(term),
    );
  }, [zonasSegunTipo, busqueda]);

  const totalElements = zonasFiltradas.length;
  const paginatedZonas = useMemo(() => {
    const start = page * rowsPerPage;
    return zonasFiltradas.slice(start, start + rowsPerPage);
  }, [zonasFiltradas, page, rowsPerPage]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando zonas...</p>;
  }

  if (!zonas || zonas.length === 0) {
    return <p className={emptyState}>No hay zonas registradas.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Caja de búsqueda de texto para zonas geográficas */}
      <div className="relative flex items-center max-w-md">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar zona por nombre, nivel de riesgo o estatus..."
          className="w-full rounded-lg border border-border bg-card py-2 pr-9 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              setPage(0);
            }}
            className="absolute right-2.5 rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className={table.wrapper}>
        <div className="overflow-x-auto">
          <table className={table.root}>
            <thead className={table.head}>
              <tr>
                <th className={table.headCell}>Nombre</th>
                <th className={table.headCell}>Nivel de riesgo</th>
                {(!tipoFiltro || tipoFiltro === "E") && (
                  <th className={table.headCell}>Entidades</th>
                )}
                {(!tipoFiltro || tipoFiltro === "P") && (
                  <th className={table.headCell}>Países</th>
                )}
                <th className={table.headCell}>Estatus</th>
                <th className={`${table.headCell} text-right`}>Doble click para ver</th>
              </tr>
            </thead>
            <tbody className={table.body}>
              {paginatedZonas.length === 0 ? (
                <tr>
                  <td
                    colSpan={tipoFiltro ? 5 : 6}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    No se encontraron zonas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedZonas.map((zona) => (
                  <tr
                    key={zona.id}
                    onClick={() => onSeleccionar(zona)}
                    onDoubleClick={() => {
                      if (onDoubleClick) {
                        onDoubleClick(zona);
                      } else {
                        onVer(zona);
                        onSeleccionar(zona);
                      }
                    }}
                    title="Doble clic para ver asignaciones de este registro"
                    className={`${table.row(zona.id === seleccionadaId)} select-none`}
                  >
                    <td className={table.cellStrong}>{zona.nombre}</td>
                    <td className={table.cell}>
                      {zona.nivelRiesgoDescripcion} ({zona.nivelRiesgoValor})
                    </td>
                    {(!tipoFiltro || tipoFiltro === "E") && (
                      <td className={table.cell}>{zona.totalEntidadesAsignadas}</td>
                    )}
                    {(!tipoFiltro || tipoFiltro === "P") && (
                      <td className={table.cell}>{zona.totalPaisesAsignados}</td>
                    )}
                    <td className="px-4 py-3">
                      <Badge tono={zona.estatus === "A" ? "activo" : "inactivo"}>
                        {zona.estatus === "A" ? "Activa" : "Inactiva"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variante="secundario"
                        className={`px-3 py-1 text-xs ${zona.id === verId ? "border-fg text-foreground" : ""}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onVer(zona);
                        }}
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Componente de Paginación Numérica */}
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
