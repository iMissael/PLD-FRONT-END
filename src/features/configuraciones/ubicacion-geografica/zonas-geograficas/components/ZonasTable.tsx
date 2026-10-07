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
<<<<<<< HEAD
  const listaZonas = useMemo(
    () =>
      Array.isArray(zonas)
        ? zonas
        : ((zonas as unknown as { contenido?: ZonaGeograficaResponse[] })?.contenido ?? []),
    [zonas],
  );

  const columns = useMemo<ColumnDef<ZonaGeograficaResponse>[]>(
    () => [
=======
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
>>>>>>> origin/develop
      {
        header: "Nombre",
        className: table.cellStrong,
        cell: (zona) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSeleccionar(zona);
            }}
            className="font-semibold text-foreground hover:text-primary hover:underline text-left cursor-pointer"
            title="Seleccionar y editar zona"
          >
            {zona.nombre}
          </button>
        ),
      },
      {
        header: "Tipo",
        cell: (zona) => <span>{zona.esEntidadEspecial ? "Especial" : "Principal"}</span>,
      },
      {
<<<<<<< HEAD
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
=======
        header: "Entidad especial",
        cell: (zona) => (
          <span className="text-xs text-muted-foreground">
            {zona.esEntidadEspecial ? "Sí" : "No"}
          </span>
        ),
      },
      {
        header: "Entidades asignadas",
        align: "right",
        headerClassName: "text-right",
        className: "text-right font-mono",
        cell: (zona) => Number(zona.totalEntidadesAsignadas ?? 0).toLocaleString("es-MX"),
>>>>>>> origin/develop
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
        header: "Acciones",
        align: "right",
        headerClassName: "text-right",
        width: "130px",
        cell: (zona) => (
          <Button
            variante={verId === zona.id ? "primario" : "secundario"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onVer(zona);
            }}
          >
            {verId === zona.id ? "Ocultar" : "Ver entidades"}
          </Button>
        ),
      },
<<<<<<< HEAD
    ],
    [verId, onVer],
  );

  return (
    <DataTable<ZonaGeograficaResponse>
=======
    ];
  }, [verId, onVer, onSeleccionar]);

  return (
    <DataTable
>>>>>>> origin/develop
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
<<<<<<< HEAD
        placeholder: "Buscar zona por nombre, tipo, nivel o estatus...",
        filterFn: (zona, term) =>
          zona.nombre.toLowerCase().includes(term) ||
          (zona.esEntidadEspecial ? "especial" : "principal").includes(term) ||
          (zona.nivelRiesgoDescripcion?.toLowerCase().includes(term) ?? false) ||
          (zona.estatus === "A" ? "activa" : "inactiva").includes(term),
=======
        placeholder: "Buscar zona de riesgo...",
        filterFn: (zona, term) => {
          const t = term.toLowerCase();
          return (
            zona.nombre.toLowerCase().includes(t) ||
            zona.nivelRiesgoDescripcion.toLowerCase().includes(t)
          );
        },
>>>>>>> origin/develop
      }}
      pagination={{
        mode: "client",
        defaultRowsPerPage: 10,
        rowsPerPageOptions: [10, 25, 30],
      }}
    />
  );
}
