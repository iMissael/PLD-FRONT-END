import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import type { PaisResponse } from "../types/pais";

interface PaisesTableProps {
  paises: PaisResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  /** Mapa idZona -> nombreZona, para mostrar el nombre en vez del id crudo. */
  nombresDeZona: Record<string, string>;
  onSeleccionar: (pais: PaisResponse) => void;
  onDoubleClick?: (pais: PaisResponse) => void;
}

export function PaisesTable({
  paises,
  isLoading,
  seleccionadoId,
  nombresDeZona,
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
        header: "PLD Zona Geográfica",
        cell: (pais) => {
          const nombresZonas = pais.zonasAsignadas
            .map((id) => nombresDeZona[id])
            .filter((nombre): nombre is string => Boolean(nombre));
          return nombresZonas.length > 0 ? nombresZonas.join(", ") : "—";
        },
      },
    ],
    [nombresDeZona],
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
        placeholder: "Buscar país por nombre, clave o zona...",
        filterFn: (pais, term) => {
          const t = term.toLowerCase().trim();
          const nombresZonas = pais.zonasAsignadas
            .map((id) => nombresDeZona[id])
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return (
            pais.nombre.toLowerCase().includes(t) ||
            pais.idPais.toLowerCase().includes(t) ||
            (pais.codigoIso?.toLowerCase().includes(t) ?? false) ||
            nombresZonas.includes(t)
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
