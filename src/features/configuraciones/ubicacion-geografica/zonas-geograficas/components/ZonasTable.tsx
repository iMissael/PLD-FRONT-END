import { useMemo } from "react";
import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { DataTable, type ColumnDef } from "@/shared/components/ui/DataTable";
import { table } from "@/shared/components/ui/styles";
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

  const columns = useMemo<ColumnDef<ZonaGeograficaResponse>[]>(() => {
    const cols: ColumnDef<ZonaGeograficaResponse>[] = [
      {
        header: "Nombre",
        accessorKey: "nombre",
        className: table.cellStrong,
      },
      {
        header: "Nivel de riesgo",
        cell: (zona) => (
          <span>
            {zona.nivelRiesgoDescripcion} ({zona.nivelRiesgoValor})
          </span>
        ),
      },
    ];

    if (!tipoFiltro || tipoFiltro === "E") {
      cols.push({
        header: "Entidades",
        accessorKey: "totalEntidadesAsignadas",
      });
    }

    if (!tipoFiltro || tipoFiltro === "P") {
      cols.push({
        header: "Países",
        accessorKey: "totalPaisesAsignados",
      });
    }

    cols.push(
      {
        header: "Estatus",
        cell: (zona) => (
          <Badge tono={zona.estatus === "A" ? "activo" : "inactivo"}>
            {zona.estatus === "A" ? "Activa" : "Inactiva"}
          </Badge>
        ),
      },
      {
        header: "Doble click para ver",
        cell: (zona) => (
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
        ),
      },
    );

    return cols;
  }, [tipoFiltro, verId, onVer]);

  return (
    <DataTable<ZonaGeograficaResponse>
      data={zonasSegunTipo}
      columns={columns}
      isLoading={isLoading}
      getRowId={(zona) => zona.id}
      selectedRowId={seleccionadaId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={(zona) => {
        if (onDoubleClick) {
          onDoubleClick(zona);
        } else {
          onVer(zona);
          onSeleccionar(zona);
        }
      }}
      doubleClickTitle="Doble clic para ver asignaciones de este registro"
      emptyMessage="No hay zonas registradas."
      search={{
        placeholder: "Buscar zona por nombre, nivel de riesgo o estatus...",
        filterFn: (zona, term) =>
          zona.nombre.toLowerCase().includes(term) ||
          (zona.nivelRiesgoDescripcion?.toLowerCase().includes(term) ?? false) ||
          (zona.estatus === "A" ? "activa" : "inactiva").includes(term),
      }}
      pagination={{
        mode: "client",
        defaultRowsPerPage: 10,
        rowsPerPageOptions: [5, 10, 25, 50],
      }}
    />
  );
}
