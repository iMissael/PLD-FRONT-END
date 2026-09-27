import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { EdadResponse } from "../types/edad";

interface EdadesTableProps {
  edades: EdadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (edad: EdadResponse) => void;
}

/**
 * El rango se muestra en una sola columna ("18 – 24 años") en vez de dos
 * columnas de números sueltos, que se leen peor. `edadFinal` puede venir null
 * (columna nullable), así que ese caso se rotula como rango abierto.
 */
function formatearRango(edadInicial: number, edadFinal: number | null): string {
  if (edadFinal === null) return `${edadInicial} años o más`;
  return `${edadInicial} – ${edadFinal} años`;
}

export function EdadesTable({
  edades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
}: EdadesTableProps) {
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
    return <p className={emptyState}>Cargando rangos de edad...</p>;
  }

  if (!edades || edades.length === 0) {
    return <p className={emptyState}>No hay rangos de edad registrados.</p>;
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
          {edades.map((edad, indice) => (
            <tr
              key={edad.id}
              onClick={() => onSeleccionar(edad)}
              className={table.row(edad.id === seleccionadaId)}
            >
              {/* Consecutivo de fila, no el id del registro: los ids dejan de
                  ser contiguos en cuanto se da de baja alguno. */}
              <td className={table.cellMuted}>{indice + 1}</td>
              <td className={table.cellStrong}>
                {formatearRango(edad.edadInicial, edad.edadFinal)}
              </td>
              <td className={table.cell}>{descripcionNivel(edad.catNivelRiesgoId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
