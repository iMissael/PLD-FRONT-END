import { useMemo, type ReactNode } from "react";
import { DataTable, type ColumnDef, type PaginationConfig, type SearchConfig } from "@/shared/components/DataTable";
import type { LocalidadResponse } from "../types/localidad";

interface LocalidadesTableProps {
  localidades: LocalidadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (localidad: LocalidadResponse) => void;
  onDoubleClick?: (localidad: LocalidadResponse) => void;
  pagination?: boolean | PaginationConfig;
  search?: boolean | SearchConfig<LocalidadResponse>;
  filterBar?: ReactNode;
}

export function LocalidadesTable({
  localidades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  onDoubleClick,
  pagination,
  search,
  filterBar,
}: LocalidadesTableProps) {
  const columns: ColumnDef<LocalidadResponse>[] = useMemo(
    () => [
      {
        header: "Nombre",
        accessorKey: "nombre",
        className: "font-semibold text-foreground",
      },
      {
        header: "Municipio",
        accessorKey: "nombreMunicipio",
        className: "text-muted-foreground",
      },
      {
        header: "Tipo de asentamiento",
        accessorKey: "tipoAsentamiento",
        className: "text-muted-foreground",
      },
      {
        header: "Nivel de riesgo",
        cell: (item) =>
          item.nivelRiesgoDescripcion
            ? `${item.nivelRiesgoDescripcion} (${item.nivelRiesgoValor})`
            : "—",
      },
    ],
    [],
  );

  return (
    <DataTable
      data={localidades}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando localidades..."
      emptyMessage="No hay localidades que coincidan con los filtros."
      seleccionadoId={seleccionadaId}
      getRowId={(localidad) => localidad.idLocalidad}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
      pagination={pagination}
      search={search}
      filterBar={filterBar}
    />
  );
}
