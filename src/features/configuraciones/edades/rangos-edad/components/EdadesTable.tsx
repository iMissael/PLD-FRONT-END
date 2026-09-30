import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { EdadResponse } from "../types/edad";

interface EdadesTableProps {
  edades: EdadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (edad: EdadResponse) => void;
  onDoubleClick?: (edad: EdadResponse) => void;
}

function formatearRango(edadInicial: number, edadFinal: number | null): string {
  if (edadFinal === null) return `${edadInicial} años o más`;
  return `${edadInicial} – ${edadFinal} años`;
}

export function EdadesTable({
  edades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  onDoubleClick,
}: EdadesTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const columns: ColumnDef<EdadResponse>[] = useMemo(
    () => [
      {
        header: "#",
        width: "60px",
        className: "text-muted-foreground",
        cell: (_, __, globalIndex) => globalIndex + 1,
      },
      {
        header: "Rango",
        className: "font-semibold text-foreground",
        cell: (item) => formatearRango(item.edadInicial, item.edadFinal),
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
      data={edades}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando rangos de edad..."
      emptyMessage="No hay rangos de edad registrados."
      seleccionadoId={seleccionadaId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
    />
  );
}
