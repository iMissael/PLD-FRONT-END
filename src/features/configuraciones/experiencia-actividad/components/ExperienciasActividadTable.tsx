import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { ExperienciaActividadResponse } from "../types/experienciaActividad";

interface ExperienciasActividadTableProps {
  experiencias: ExperienciaActividadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (experiencia: ExperienciaActividadResponse) => void;
  onDoubleClick?: (experiencia: ExperienciaActividadResponse) => void;
}

export function ExperienciasActividadTable({
  experiencias,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  onDoubleClick,
}: ExperienciasActividadTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const columns: ColumnDef<ExperienciaActividadResponse>[] = useMemo(
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
      data={experiencias}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando experiencias de actividad..."
      emptyMessage="No hay experiencias de actividad registradas."
      seleccionadoId={seleccionadaId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
    />
  );
}
