import { useMemo } from "react";
import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { DataTable, type ColumnDef } from "@/shared/components/ui/DataTable";
import { table } from "@/shared/components/ui/styles";
import type { ListaPaisResponse } from "../types/listaPais";

interface ListasPaisesTableProps {
  listas: ListaPaisResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  verId: string | null;
  onSeleccionar: (lista: ListaPaisResponse) => void;
  onVer: (lista: ListaPaisResponse) => void;
  onDoubleClick?: (lista: ListaPaisResponse) => void;
}

export function ListasPaisesTable({
  listas,
  isLoading,
  seleccionadaId,
  verId,
  onSeleccionar,
  onVer,
  onDoubleClick,
}: ListasPaisesTableProps) {
  const listaItems = useMemo(() => {
    if (!listas) return [];
    if (Array.isArray(listas)) return listas;
    if (Array.isArray((listas as unknown as { contenido?: typeof listas })?.contenido)) {
      return (listas as unknown as { contenido: typeof listas }).contenido ?? [];
    }
    return [];
  }, [listas]);

  const columns = useMemo<ColumnDef<ListaPaisResponse>[]>(() => {
    return [
      {
        header: "Nombre",
        accessorKey: "nombre",
        className: table.cellStrong,
      },
      {
        header: "Nivel de riesgo",
        cell: (lista) => (
          <span>
            {lista.nivelRiesgoDescripcion} ({lista.nivelRiesgoValor})
          </span>
        ),
      },
      {
        header: "Países asignados",
        accessorKey: "totalPaisesAsignados",
      },
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
            variante={verId === lista.id ? "primario" : "secundario"}
            tamanio="pequeno"
            onClick={(e) => {
              e.stopPropagation();
              onVer(lista); 
            }}
          >
            {verId === lista.id ? "Ocultar" : "Ver países"}
          </Button>
        ),
      },
    ];
  }, [verId, onVer]);

  return (
    <DataTable
      data={listaItems}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando listas de países..."
      emptyMessage="No hay listas de países registradas."
      seleccionadoId={seleccionadaId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para ver los países de esta lista"
      search={{
        placeholder: "Buscar lista de países...",
        filterFn: (lista, term) => {
          const t = term.toLowerCase();
          return (
            lista.nombre.toLowerCase().includes(t) ||
            lista.nivelRiesgoDescripcion.toLowerCase().includes(t)
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
