import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { PrestamoMontoResponse } from "../types/prestamoMonto";
import { formatearRangoMonto } from "../utils/nombreMonto";

interface PrestamosMontoTableProps {
  rangos: PrestamoMontoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (rango: PrestamoMontoResponse) => void;
}

export function PrestamosMontoTable({
  rangos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
}: PrestamosMontoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const descripcionNivel = (catNivelRiesgoId: number) => {
    const nivel = niveles?.find((item) => item.id === catNivelRiesgoId);
    if (!nivel) return String(catNivelRiesgoId);
    return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando rangos de monto...</p>;
  }

  if (!rangos || rangos.length === 0) {
    return <p className={emptyState}>No hay rangos de monto registrados.</p>;
  }

  return (
    <div className={table.wrapper}>
      <table className={table.root}>
        <thead className={table.head}>
          <tr>
            <th className={`w-16 ${table.headCell}`}>#</th>
            <th className={table.headCell}>Rango</th>
            <th className={table.headCell}>Nivel de riesgo</th>
          </tr>
        </thead>
        <tbody className={table.body}>
          {rangos.map((rango, indice) => (
            <tr
              key={rango.id}
              onClick={() => onSeleccionar(rango)}
              className={table.row(rango.id === seleccionadoId)}
            >
              {/* Consecutivo de fila, no el id del registro. */}
              <td className={table.cellMuted}>{indice + 1}</td>
              {/* Se muestra el rango y no el `nombre` guardado: los 5 registros
                  sembrados se llaman "RANGO UNO".."RANGO CINCO", etiquetas que
                  no dicen nada de los montos. */}
              <td className={table.cellStrong}>
                {formatearRangoMonto(rango.montoMin, rango.montoMax)}
              </td>
              <td className={table.cell}>{descripcionNivel(rango.catNivelRiesgoId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
