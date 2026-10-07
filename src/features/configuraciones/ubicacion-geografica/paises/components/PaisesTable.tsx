import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import type { PaisResponse } from "../types/pais";

export interface InfoListaPais {
  nombre: string;
  nivelRiesgoDescripcion: string;
  nivelRiesgoValor: number;
}

interface PaisesTableProps {
  paises: PaisResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  /** Mapa idLista -> información de la lista de país (nombre, nivel de riesgo). */
  mapaListas: Record<string, InfoListaPais>;
  onSeleccionar: (pais: PaisResponse) => void;
  onDoubleClick?: (pais: PaisResponse) => void;
}

export function PaisesTable({
  paises,
  isLoading,
  seleccionadoId,
  mapaListas,
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
        header: "Listas de riesgo",
        cell: (pais) => {
          const asignadas = Array.isArray(pais.zonasAsignadas) ? pais.zonasAsignadas : [];
          const nombresListas = asignadas
            .map((id) => mapaListas[id]?.nombre)
            .filter((nombre): nombre is string => Boolean(nombre));
          return nombresListas.length > 0 ? nombresListas.join(", ") : "—";
        },
      },
      {
        header: "Nivel de riesgo",
        cell: (pais) => {
          const asignadas = Array.isArray(pais.zonasAsignadas) ? pais.zonasAsignadas : [];
          const niveles = asignadas
            .map((id) => {
              const info = mapaListas[id];
              return info
                ? `${info.nivelRiesgoDescripcion} (${info.nivelRiesgoValor})`
                : null;
            })
            .filter((n): n is string => Boolean(n));
          return niveles.length > 0 ? niveles.join(", ") : "—";
        },
      },
    ],
    [mapaListas],
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
        placeholder: "Buscar país por nombre, clave, lista o nivel...",
        filterFn: (pais, term) => {
          const t = term.toLowerCase().trim();
          const asignadas = Array.isArray(pais.zonasAsignadas) ? pais.zonasAsignadas : [];
          const nombresListas = asignadas
            .map((id) => mapaListas[id]?.nombre)
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          const nivelesRiesgo = asignadas
            .map((id) => {
              const info = mapaListas[id];
              return info
                ? `${info.nivelRiesgoDescripcion} ${info.nivelRiesgoValor}`
                : "";
            })
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return (
            pais.nombre.toLowerCase().includes(t) ||
            pais.idPais.toLowerCase().includes(t) ||
            (pais.codigoIso?.toLowerCase().includes(t) ?? false) ||
            nombresListas.includes(t) ||
            nivelesRiesgo.includes(t)
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
