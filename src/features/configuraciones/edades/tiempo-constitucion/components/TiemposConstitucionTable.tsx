import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { TiempoConstitucionResponse } from "../types/tiempoConstitucion";

interface TiemposConstitucionTableProps {
  tiempos: TiempoConstitucionResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (tiempo: TiempoConstitucionResponse) => void;
  onDoubleClick?: (tiempo: TiempoConstitucionResponse) => void;
}

export function TiemposConstitucionTable({
  tiempos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: TiemposConstitucionTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const columns: ColumnDef<TiempoConstitucionResponse>[] = useMemo(
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
          return nivel ? `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})` : String(item.catNivelRiesgoId);
        },
      },
    ],
    [niveles],
  );

  return (
    <DataTable
      data={tiempos}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando tiempos de constitución..."
      emptyMessage="No hay tiempos de constitución registrados."
      seleccionadoId={seleccionadoId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
    />
  );
}
