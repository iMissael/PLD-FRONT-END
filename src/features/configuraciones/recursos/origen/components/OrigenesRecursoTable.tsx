import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { OrigenRecursoResponse } from "../types/origenRecurso";

interface OrigenesRecursoTableProps {
  origenes: OrigenRecursoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (origen: OrigenRecursoResponse) => void;
}

export function OrigenesRecursoTable({
  origenes,
  isLoading,
  seleccionadoId,
  onSeleccionar,
}: OrigenesRecursoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const descripcionNivel = (catNivelRiesgoId: number) => {
    const nivel = niveles?.find((item) => item.id === catNivelRiesgoId);
    if (!nivel) return String(catNivelRiesgoId);
    return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando orígenes de recurso...</p>;
  }

  if (!origenes || origenes.length === 0) {
    return <p className={emptyState}>No hay orígenes de recurso registrados.</p>;
  }

  return (
    <div className={table.wrapper}>
      <table className={table.root}>
        <thead className={table.head}>
          <tr>
            <th className={`w-16 ${table.headCell}`}>#</th>
            <th className={table.headCell}>Nombre</th>
            <th className={table.headCell}>Nivel de riesgo</th>
          </tr>
        </thead>
        <tbody className={table.body}>
          {origenes.map((origen, indice) => (
            <tr
              key={origen.id}
              onClick={() => onSeleccionar(origen)}
              className={table.row(origen.id === seleccionadoId)}
            >
              {/* Consecutivo de fila, no el id del registro. */}
              <td className={table.cellMuted}>{indice + 1}</td>
              <td className={table.cellStrong}>{origen.nombre}</td>
              <td className={table.cell}>{descripcionNivel(origen.catNivelRiesgoId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
