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
  const listaZonas = useMemo(() => {
    if (!zonas) return [];
    if (Array.isArray(zonas)) return zonas;
    if (Array.isArray((zonas as unknown as { contenido?: typeof zonas })?.contenido)) {
      return (zonas as unknown as { contenido: typeof zonas }).contenido ?? [];
    }
    return [];
  }, [zonas]);

  const columns = useMemo<ColumnDef<ZonaGeograficaResponse>[]>(() => {
    return [
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
      {
        header: "Entidad especial",
        cell: (zona) => (
          <span className="text-xs text-muted-foreground">
            {zona.esEntidadEspecial ? "Sí" : "No"}
          </span>
        ),
      },
      {
        header: "Entidades asignadas",
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
            variante={verId === zona.id ? "primario" : "secundario"}
            tamanio="pequeno"
            onClick={(e) => {
              e.stopPropagation();
              onVer(zona);
            }}
          >
            {verId === zona.id ? "Ocultar" : "Ver entidades"}
          </Button>
        ),
      },
    ];
  }, [verId, onVer]);

  return (
    <DataTable
      data={listaZonas}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando zonas de riesgo..."
      emptyMessage="No hay zonas de riesgo registradas."
      seleccionadoId={seleccionadaId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para ver las entidades de esta zona"
      search={{
        placeholder: "Buscar zona de riesgo...",
        filterFn: (zona, term) => {
          const t = term.toLowerCase();
          return (
            zona.nombre.toLowerCase().includes(t) ||
            zona.nivelRiesgoDescripcion.toLowerCase().includes(t)
          );
        },
      }}
      pagination={{
        mode: "client",
        defaultRowsPerPage: 10,
        rowsPerPageOptions: [5, 10, 25, 50],
      }}
    />
  );
}
