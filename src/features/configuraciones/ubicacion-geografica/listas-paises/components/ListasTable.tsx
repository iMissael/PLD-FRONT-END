import { useMemo } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { DataTable, type ColumnDef } from "@/shared/components/ui/DataTable";
import { table } from "@/shared/components/ui/styles";

import type { ListaPaisResponse } from "../types/listaPais";

interface ListasTableProps {
  listas: ListaPaisResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  verId: string | null;
  onSeleccionar: (lista: ListaPaisResponse) => void;
  onVer: (lista: ListaPaisResponse) => void;
}

export function ListasTable({ listas, isLoading, seleccionadaId, verId, onSeleccionar, onVer }: ListasTableProps) {
  const columns = useMemo<ColumnDef<ListaPaisResponse>[]>(
    () => [
      { header: "Nombre", accessorKey: "nombre", className: table.cellStrong },
      {
        header: "Nivel de riesgo",
        cell: (lista) => (
          <span>
            {lista.nivelRiesgoDescripcion ?? "—"}
            {lista.nivelRiesgoValor != null ? ` (${lista.nivelRiesgoValor})` : ""}
          </span>
        ),
      },
      { header: "Países", accessorKey: "totalPaisesAsignados" },
      {
        header: "Estatus",
        cell: (lista) => (
          <Badge tono={lista.estatus === "A" ? "activo" : "inactivo"}>
            {lista.estatus === "A" ? "Activa" : "Inactiva"}
          </Badge>
        ),
      },
      {
        header: "Doble click para ver",
        cell: (lista) => (
          <Button
            variante="secundario"
            className={`px-3 py-1 text-xs ${lista.id === verId ? "border-fg text-foreground" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              onVer(lista);
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
    <DataTable<ListaPaisResponse>
      data={listas ?? []}
      columns={columns}
      isLoading={isLoading}
      getRowId={(lista) => lista.id}
      selectedRowId={seleccionadaId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={(lista) => {
        onVer(lista);
        onSeleccionar(lista);
      }}
      doubleClickTitle="Doble clic para ver los países de esta lista"
      emptyMessage="No hay listas registradas."
      search={{
        placeholder: "Buscar lista por nombre, nivel o estatus...",
        filterFn: (lista, term) =>
          lista.nombre.toLowerCase().includes(term) ||
          (lista.nivelRiesgoDescripcion?.toLowerCase().includes(term) ?? false) ||
          (lista.estatus === "A" ? "activa" : "inactiva").includes(term),
      }}
      pagination={{ mode: "client", defaultRowsPerPage: 10, rowsPerPageOptions: [5, 10, 25, 50] }}
    />
  );
}
