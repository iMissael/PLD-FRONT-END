import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { TiempoConstitucionResponse } from "../types/tiempoConstitucion";

interface TiemposConstitucionTableProps {
  tiempos: TiempoConstitucionResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (tiempo: TiempoConstitucionResponse) => void;
}

export function TiemposConstitucionTable({
  tiempos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
}: TiemposConstitucionTableProps) {
  // El listado solo trae `catNivelRiesgoId` (un número); la descripción se
  // resuelve cruzando con el catálogo de niveles, que ya está en caché porque
  // el formulario lo usa para su `<select>`.
  const { data: niveles } = useNivelesRiesgo();

  const descripcionNivel = (catNivelRiesgoId: number) => {
    const nivel = niveles?.find((item) => item.id === catNivelRiesgoId);
    if (!nivel) return String(catNivelRiesgoId);
    return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando tiempos de constitución...</p>;
  }

  if (!tiempos || tiempos.length === 0) {
    return <p className={emptyState}>No hay tiempos de constitución registrados.</p>;
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
          {tiempos.map((tiempo, indice) => (
            <tr
              key={tiempo.id}
              onClick={() => onSeleccionar(tiempo)}
              className={table.row(tiempo.id === seleccionadoId)}
            >
              {/* Consecutivo de fila, no el id del registro: los ids dejan de
                  ser contiguos en cuanto se da de baja alguno. */}
              <td className={table.cellMuted}>{indice + 1}</td>
              {/* `nombre` es el valor guardado en la base, no uno recalculado:
                  así se ve el dato real si un registro viejo no sigue la
                  convención que genera esta pantalla. */}
              <td className={table.cellStrong}>{tiempo.nombre}</td>
              <td className={table.cell}>{descripcionNivel(tiempo.catNivelRiesgoId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
