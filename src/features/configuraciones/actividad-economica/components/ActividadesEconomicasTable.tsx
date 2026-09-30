import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { ActividadEconomicaResponse } from "../types/actividadEconomica";

interface ActividadesEconomicasTableProps {
  actividades: ActividadEconomicaResponse[];
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (actividad: ActividadEconomicaResponse) => void;
  onDoubleClick?: (actividad: ActividadEconomicaResponse) => void;
  /** Índice de la primera fila de la página, para que el consecutivo continúe. */
  offset: number;
}

export function ActividadesEconomicasTable({
  actividades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  onDoubleClick,
  offset,
}: ActividadesEconomicasTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const descripcionNivel = (catNivelRiesgoId: number) => {
    const nivel = niveles?.find((item) => item.id === catNivelRiesgoId);
    if (!nivel) return String(catNivelRiesgoId);
    return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando actividades económicas...</p>;
  }

  if (actividades.length === 0) {
    return <p className={emptyState}>No hay actividades económicas que coincidan.</p>;
  }

  return (
    <div className={table.wrapper}>
      <table className={table.root}>
        <thead className={table.head}>
          <tr>
            <th className={`w-20 ${table.headCell}`}>#</th>
            <th className={`w-32 ${table.headCell}`}>Clave</th>
            <th className={table.headCell}>Descripción</th>
            <th className={table.headCell}>Nivel de riesgo</th>
          </tr>
        </thead>
        <tbody className={table.body}>
          {actividades.map((actividad, indice) => (
            <tr
              key={actividad.id}
              onClick={() => onSeleccionar(actividad)}
              onDoubleClick={() => {
                if (onDoubleClick) onDoubleClick(actividad);
                else onSeleccionar(actividad);
              }}
              title="Doble clic para modificar este registro"
              className={`${table.row(actividad.id === seleccionadaId)} select-none`}
            >
              {/* Consecutivo de fila dentro del listado filtrado, no el id
                  del registro. `offset` lo continúa entre páginas. */}
              <td className={table.cellMuted}>{offset + indice + 1}</td>
              <td className={`${table.cellMuted} font-mono text-xs`}>
                {actividad.claveSat}
              </td>
              <td className={table.cellStrong}>{actividad.descripcion}</td>
              <td className={table.cell}>
                {descripcionNivel(actividad.catNivelRiesgoId)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
