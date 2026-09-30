import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { HistorialCrediticioResponse } from "../types/historialCrediticio";

interface HistorialesCrediticiosTableProps {
  historiales: HistorialCrediticioResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (historial: HistorialCrediticioResponse) => void;
}

export function HistorialesCrediticiosTable({
  historiales,
  isLoading,
  seleccionadoId,
  onSeleccionar,
}: HistorialesCrediticiosTableProps) {
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
    return <p className={emptyState}>Cargando historiales crediticios...</p>;
  }

  if (!historiales || historiales.length === 0) {
    return <p className={emptyState}>No hay historiales crediticios registrados.</p>;
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
          {historiales.map((historial, indice) => (
            <tr
              key={historial.id}
              onClick={() => onSeleccionar(historial)}
              className={table.row(historial.id === seleccionadoId)}
            >
              {/* Consecutivo de fila, no el id del registro. */}
              <td className={table.cellMuted}>{indice + 1}</td>
              <td className={table.cellStrong}>{historial.nombre}</td>
              <td className={table.cell}>
                {descripcionNivel(historial.catNivelRiesgoId)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
