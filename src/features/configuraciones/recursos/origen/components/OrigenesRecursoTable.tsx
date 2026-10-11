import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { OrigenRecursoResponse } from "../types/origenRecurso";

interface OrigenesRecursoTableProps {
  origenes: OrigenRecursoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (origen: OrigenRecursoResponse) => void;
  onDoubleClick?: (origen: OrigenRecursoResponse) => void;
}

export function OrigenesRecursoTable({
  origenes,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: OrigenesRecursoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const listaNiveles = Array.isArray(niveles)
    ? niveles
    : Array.isArray((niveles as unknown as { contenido?: typeof niveles })?.contenido)
    ? ((niveles as unknown as { contenido: typeof niveles }).contenido ?? [])
    : [];

  const columns: ColumnDef<OrigenRecursoResponse>[] = useMemo(
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
      data={origenes}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando orígenes de recurso..."
      emptyMessage="No hay orígenes de recurso registrados."
      seleccionadoId={seleccionadoId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
      search={{
        placeholder: "Buscar origen de recurso...",
      }}
      pagination={{
        mode: "client",
        defaultRowsPerPage: 10,
        rowsPerPageOptions: [10, 25, 30],
      }}
    />
  );
}
