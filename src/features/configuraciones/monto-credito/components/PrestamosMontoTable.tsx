import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { PrestamoMontoResponse } from "../types/prestamoMonto";
import { formatearRangoMonto } from "../utils/nombreMonto";

interface PrestamosMontoTableProps {
  rangos: PrestamoMontoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (rango: PrestamoMontoResponse) => void;
  onDoubleClick?: (rango: PrestamoMontoResponse) => void;
}

export function PrestamosMontoTable({
  rangos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: PrestamosMontoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const listaNiveles = Array.isArray(niveles)
    ? niveles
    : Array.isArray((niveles as unknown as { contenido?: typeof niveles })?.contenido)
    ? ((niveles as unknown as { contenido: typeof niveles }).contenido ?? [])
    : [];

  const columns: ColumnDef<PrestamoMontoResponse>[] = useMemo(
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
        cell: (item) => formatearRangoMonto(item.montoMin, item.montoMax),
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
      data={rangos}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando rangos de monto..."
      emptyMessage="No hay rangos de monto registrados."
      seleccionadoId={seleccionadoId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
      search={{
        placeholder: "Buscar rango de monto...",
      }}
      pagination={{
        mode: "client",
        defaultRowsPerPage: 10,
        rowsPerPageOptions: [5, 10, 25, 50],
      }}
    />
  );
}
