import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { PepResponse } from "../types/pep";

interface PepsTableProps {
  peps: PepResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (pep: PepResponse) => void;
  onDoubleClick?: (pep: PepResponse) => void;
}

export function PepsTable({
  peps,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: PepsTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const listaNiveles = Array.isArray(niveles)
    ? niveles
    : Array.isArray((niveles as unknown as { contenido?: typeof niveles })?.contenido)
    ? ((niveles as unknown as { contenido: typeof niveles }).contenido ?? [])
    : [];

  const columns: ColumnDef<PepResponse>[] = useMemo(
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
      data={peps}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando categorías PEP..."
      emptyMessage="No hay categorías PEP registradas."
      seleccionadoId={seleccionadoId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
      search={{
        placeholder: "Buscar categoría PEP...",
      }}
      pagination={{
        mode: "client",
        defaultRowsPerPage: 10,
        rowsPerPageOptions: [5, 10, 25, 50],
      }}
    />
  );
}
