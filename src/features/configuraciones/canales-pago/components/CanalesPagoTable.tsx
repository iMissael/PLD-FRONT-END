import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { CanalPagoResponse } from "../types/canalPago";

interface CanalesPagoTableProps {
  canales: CanalPagoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (canal: CanalPagoResponse) => void;
}

export function CanalesPagoTable({
  canales,
  isLoading,
  seleccionadoId,
  onSeleccionar,
}: CanalesPagoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const descripcionNivel = (catNivelRiesgoId: number) => {
    const nivel = niveles?.find((item) => item.id === catNivelRiesgoId);
    if (!nivel) return String(catNivelRiesgoId);
    return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando canales de pago...</p>;
  }

  if (!canales || canales.length === 0) {
    return <p className={emptyState}>No hay canales de pago registrados.</p>;
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
          {canales.map((canal, indice) => (
            <tr
              key={canal.id}
              onClick={() => onSeleccionar(canal)}
              className={table.row(canal.id === seleccionadoId)}
            >
              {/* Consecutivo de fila, no el id del registro. */}
              <td className={table.cellMuted}>{indice + 1}</td>
              <td className={table.cellStrong}>{canal.nombre}</td>
              <td className={table.cell}>{descripcionNivel(canal.catNivelRiesgoId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
