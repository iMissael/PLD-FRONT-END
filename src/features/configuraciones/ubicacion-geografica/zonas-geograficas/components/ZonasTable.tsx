import { useMemo } from "react";
import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { DataTable, type ColumnDef } from "@/shared/components/ui/DataTable";
import { table } from "@/shared/components/ui/styles";
import type { ZonaGeograficaResponse } from "../types/zonaGeografica";

interface ZonasTableProps {
  zonas: ZonaGeograficaResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  verId: string | null;
  onSeleccionar: (zona: ZonaGeograficaResponse) => void;
  onVer: (zona: ZonaGeograficaResponse) => void;
  onDoubleClick?: (zona: ZonaGeograficaResponse) => void;
}

export function ZonasTable({
  zonas,
  isLoading,
  seleccionadaId,
  verId,
  onSeleccionar,
  onVer,
  onDoubleClick,
}: ZonasTableProps) {
  const listaZonas = useMemo(
    () =>
      Array.isArray(zonas)
        ? zonas
        : ((zonas as unknown as { contenido?: ZonaGeograficaResponse[] })?.contenido ?? []),
    [zonas],
  );

  const columns = useMemo<ColumnDef<ZonaGeograficaResponse>[]>(
    () => [
      {
        header: "Nombre",
        accessorKey: "nombre",
        className: table.cellStrong,
      },
      {
        header: "Tipo",
        cell: (zona) => <span>{zona.esEntidadEspecial ? "Especial" : "Principal"}</span>,
      },
      {
        header: "Nivel de riesgo",
        cell: (zona) =>
          zona.esEntidadEspecial ? (
            <span className="text-muted-foreground">El de la zona principal de cada entidad</span>
          ) : (
            <span>
              {zona.nivelRiesgoDescripcion ?? "—"}
              {zona.nivelRiesgoValor != null ? ` (${zona.nivelRiesgoValor})` : ""}
            </span>
          ),
      },
      {
        header: "Entidades",
        accessorKey: "totalEntidadesAsignadas",
      },
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
    ],
    [verId, onVer],
  );

  return (
    <DataTable<ZonaGeograficaResponse>
      data={listaZonas}
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
        placeholder: "Buscar zona por nombre, tipo, nivel o estatus...",
        filterFn: (zona, term) =>
          zona.nombre.toLowerCase().includes(term) ||
          (zona.esEntidadEspecial ? "especial" : "principal").includes(term) ||
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
