import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { HistorialCrediticioResponse } from "../types/historialCrediticio";

interface HistorialesCrediticiosTableProps {
  historiales: HistorialCrediticioResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (historial: HistorialCrediticioResponse) => void;
  onDoubleClick?: (historial: HistorialCrediticioResponse) => void;
}

export function HistorialesCrediticiosTable({
  historiales,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: HistorialesCrediticiosTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const columns: ColumnDef<HistorialCrediticioResponse>[] = useMemo(
    () => [
      {
        header: "#",
        width: "60px",
        className: "text-muted-foreground",
        cell: (_, __, globalIndex) => globalIndex + 1,
      },
      {
        header: "Nombre",
        accessorKey: "nombre",
        className: "font-semibold text-foreground",
      },
      {
        header: "Nivel de riesgo",
        cell: (item) => {
          const nivel = niveles?.find((n) => n.id === item.catNivelRiesgoId);
          if (!nivel) return String(item.catNivelRiesgoId);
          return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
        },
      },
    ],
    [niveles],
  );

  return (
    <DataTable
      data={historiales}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando historiales crediticios..."
      emptyMessage="No hay historiales crediticios registrados."
      seleccionadoId={seleccionadoId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
    />
  );
}
