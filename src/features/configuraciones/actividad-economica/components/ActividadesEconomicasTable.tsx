import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { ActividadEconomicaResponse } from "../types/actividadEconomica";

interface ActividadesEconomicasTableProps {
  actividades: ActividadEconomicaResponse[];
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (actividad: ActividadEconomicaResponse) => void;
  onDoubleClick?: (actividad: ActividadEconomicaResponse) => void;
}

export function ActividadesEconomicasTable({
  actividades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  onDoubleClick,
}: ActividadesEconomicasTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const listaNiveles = Array.isArray(niveles)
    ? niveles
    : Array.isArray((niveles as unknown as { contenido?: typeof niveles })?.contenido)
    ? ((niveles as unknown as { contenido: typeof niveles }).contenido ?? [])
    : [];

  const columns: ColumnDef<ActividadEconomicaResponse>[] = useMemo(
    () => [
      {
        header: "#",
        width: "60px",
        className: "text-muted-foreground",
        cell: (_, __, globalIndex) => globalIndex + 1,
      },
      {
        header: "Clave SAT",
        accessorKey: "claveSat",
        className: "font-mono text-xs text-muted-foreground",
        width: "120px",
      },
      {
        header: "Descripción",
        accessorKey: "descripcion",
        className: "font-semibold text-foreground",
      },
      {
        header: "Nivel de riesgo",
        cell: (item) => {
          const nivel = listaNiveles.find((n) => n.id === item.catNivelRiesgoId);
          return nivel ? `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})` : String(item.catNivelRiesgoId);
        },
      },
    ],
    [listaNiveles],
  );

  return (
    <DataTable
      data={actividades}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando actividades económicas..."
      emptyMessage="No hay actividades económicas que coincidan."
      seleccionadoId={seleccionadaId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
      pagination={{
        mode: "client",
        defaultRowsPerPage: 10,
        rowsPerPageOptions: [10, 25, 30],
      }}
    />
  );
}
