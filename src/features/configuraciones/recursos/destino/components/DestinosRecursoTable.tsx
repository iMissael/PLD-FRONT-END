import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { DestinoRecursoResponse } from "../types/destinoRecurso";

interface DestinosRecursoTableProps {
  destinos: DestinoRecursoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (destino: DestinoRecursoResponse) => void;
}

export function DestinosRecursoTable({
  destinos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
}: DestinosRecursoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const descripcionNivel = (catNivelRiesgoId: number) => {
    const nivel = niveles?.find((item) => item.id === catNivelRiesgoId);
    if (!nivel) return String(catNivelRiesgoId);
    return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando destinos de recurso...</p>;
  }

  if (!destinos || destinos.length === 0) {
    return <p className={emptyState}>No hay destinos de recurso registrados.</p>;
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
          {destinos.map((destino, indice) => (
            <tr
              key={destino.id}
              onClick={() => onSeleccionar(destino)}
              className={table.row(destino.id === seleccionadoId)}
            >
              {/* Consecutivo de fila, no el id del registro. */}
              <td className={table.cellMuted}>{indice + 1}</td>
              <td className={table.cellStrong}>{destino.nombre}</td>
              <td className={table.cell}>{descripcionNivel(destino.catNivelRiesgoId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
