import { useMemo } from "react";

import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/CatalogoBadge";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import { ETIQUETAS_TIPO_PEP, type PepResponse } from "../types/pep";

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

  const listaNiveles = useMemo(() => (Array.isArray(niveles) ? niveles : []), [niveles]);

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
        header: "Tipo de PEP",
        width: "140px",
        cell: (item) => ETIQUETAS_TIPO_PEP[item.tipoPep] ?? item.tipoPep,
      },
      {
        header: "Nivel de riesgo",
        cell: (item) => {
          const nivel = listaNiveles.find((n) => n.id === item.catNivelRiesgoId);
          return nivel
            ? `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`
            : String(item.catNivelRiesgoId);
        },
      },
      {
        header: "Estatus",
        width: "110px",
        cell: (item) => (
          <Badge tono={item.estatus === "A" ? "activo" : "inactivo"}>
            {item.estatus === "A" ? "Activo" : item.estatus === "B" ? "Baja" : "Inactivo"}
          </Badge>
        ),
      },
    ],
    [listaNiveles],
  );

  return (
    <DataTable
      data={peps}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando PEPs..."
      emptyMessage="No hay PEPs registrados."
      seleccionadoId={seleccionadoId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
      search={{
        placeholder: "Buscar PEP por nombre o tipo...",
      }}
      pagination={{
        mode: "client",
        defaultRowsPerPage: 10,
        rowsPerPageOptions: [10, 25, 30],
      }}
    />
  );
}
