import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { DestinoRecursoResponse } from "../types/destinoRecurso";

interface DestinosRecursoTableProps {
  destinos: DestinoRecursoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (destino: DestinoRecursoResponse) => void;
  onDoubleClick?: (destino: DestinoRecursoResponse) => void;
}

export function DestinosRecursoTable({
  destinos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: DestinosRecursoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const listaNiveles = Array.isArray(niveles)
    ? niveles
    : Array.isArray((niveles as unknown as { contenido?: typeof niveles })?.contenido)
    ? ((niveles as unknown as { contenido: typeof niveles }).contenido ?? [])
    : [];

  const columns: ColumnDef<DestinoRecursoResponse>[] = useMemo(
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
          const nivel = listaNiveles.find((n) => n.id === item.catNivelRiesgoId);
          if (!nivel) return String(item.catNivelRiesgoId);
          return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
        },
      },
    ],
    [listaNiveles],
  );

  return (
    <DataTable
      data={destinos}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando destinos de recurso..."
      emptyMessage="No hay destinos de recurso registrados."
      seleccionadoId={seleccionadoId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
      search={{
        placeholder: "Buscar destino de recurso...",
      }}
      pagination={{
        mode: "client",
        defaultRowsPerPage: 10,
        rowsPerPageOptions: [10, 25, 30],
      }}
    />
  );
}
