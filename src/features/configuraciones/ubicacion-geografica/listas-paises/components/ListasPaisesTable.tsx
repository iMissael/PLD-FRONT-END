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
        className: table.cellStrong,
        cell: (lista) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSeleccionar(lista);
            }}
            className="font-semibold text-foreground hover:text-primary hover:underline text-left cursor-pointer"
            title="Seleccionar y editar lista"
          >
            {lista.nombre}
          </button>
        ),
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
        align: "right",
        headerClassName: "text-right",
        className: "text-right font-mono",
        cell: (lista) => Number(lista.totalPaisesAsignados ?? 0).toLocaleString("es-MX"),
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
        header: "Acciones",
        align: "right",
        headerClassName: "text-right",
        width: "130px",
        cell: (lista) => (
          <Button
            variante={verId === lista.id ? "primario" : "secundario"}
            size="sm"
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
  }, [verId, onVer, onSeleccionar]);

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
        rowsPerPageOptions: [10, 25, 30],
      }}
    />
  );
}
