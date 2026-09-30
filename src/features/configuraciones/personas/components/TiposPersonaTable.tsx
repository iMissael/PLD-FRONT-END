import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { TipoPersonaResponse } from "../types/tipoPersona";

interface TiposPersonaTableProps {
  tipos: TipoPersonaResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (tipo: TipoPersonaResponse) => void;
  onDoubleClick?: (tipo: TipoPersonaResponse) => void;
}

export function TiposPersonaTable({
  tipos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: TiposPersonaTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const columns: ColumnDef<TipoPersonaResponse>[] = useMemo(
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
      data={tipos}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando tipos de persona..."
      emptyMessage="No hay tipos de persona registrados."
      seleccionadoId={seleccionadoId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
    />
  );
}
