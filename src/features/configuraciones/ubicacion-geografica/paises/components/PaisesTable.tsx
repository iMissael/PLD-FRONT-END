import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import type { PaisResponse } from "../types/pais";

interface PaisesTableProps {
  paises: PaisResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  /** Mapa idLista -> nombre de la lista, para mostrar el nombre en vez del id crudo. */
  nombresDeLista: Record<string, string>;
  onSeleccionar: (pais: PaisResponse) => void;
  onDoubleClick?: (pais: PaisResponse) => void;
}

export function PaisesTable({
  paises,
  isLoading,
  seleccionadoId,
  nombresDeLista,
  onSeleccionar,
  onDoubleClick,
}: PaisesTableProps) {
  const columns: ColumnDef<PaisResponse>[] = useMemo(
    () => [
      {
        header: "Clave",
        accessorKey: "idPais",
        className: "font-mono font-semibold text-foreground",
        width: "120px",
      },
      {
        header: "País",
        accessorKey: "nombre",
        className: "font-medium text-foreground",
      },
      {
        header: "Listas de riesgo PLD",
        cell: (pais) => {
          const nombresListas = pais.listasAsignadas
            .map((id) => nombresDeLista[id])
            .filter((nombre): nombre is string => Boolean(nombre));
          return nombresListas.length > 0 ? nombresListas.join(", ") : "—";
        },
      },
    ],
    [nombresDeLista],
  );

  return (
    <DataTable
      data={paises}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando países..."
      emptyMessage="No hay países registrados."
      seleccionadoId={seleccionadoId}
      getRowId={(pais) => pais.idPais}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
      search={{
        placeholder: "Buscar país por nombre, clave o lista de riesgo...",
        filterFn: (pais, term) => {
          const t = term.toLowerCase().trim();
          const nombresListas = pais.listasAsignadas
            .map((id) => nombresDeLista[id])
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return (
            pais.nombre.toLowerCase().includes(t) ||
            pais.idPais.toLowerCase().includes(t) ||
            (pais.codigoIso?.toLowerCase().includes(t) ?? false) ||
            nombresListas.includes(t)
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
