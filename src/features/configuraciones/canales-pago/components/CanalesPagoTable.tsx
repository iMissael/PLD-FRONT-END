import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { CanalPagoResponse } from "../types/canalPago";

interface CanalesPagoTableProps {
  canales: CanalPagoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (canal: CanalPagoResponse) => void;
  onDoubleClick?: (canal: CanalPagoResponse) => void;
}

export function CanalesPagoTable({
  canales,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: CanalesPagoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const columns: ColumnDef<CanalPagoResponse>[] = useMemo(
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
      data={canales}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando canales de pago..."
      emptyMessage="No hay canales de pago registrados."
      seleccionadoId={seleccionadoId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
    />
  );
}
