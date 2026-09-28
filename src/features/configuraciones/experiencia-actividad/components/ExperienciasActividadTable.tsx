import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { ExperienciaActividadResponse } from "../types/experienciaActividad";

interface ExperienciasActividadTableProps {
  experiencias: ExperienciaActividadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (experiencia: ExperienciaActividadResponse) => void;
}

export function ExperienciasActividadTable({
  experiencias,
  isLoading,
  seleccionadaId,
  onSeleccionar,
}: ExperienciasActividadTableProps) {
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
    return <p className={emptyState}>Cargando experiencias de actividad...</p>;
  }

  if (!experiencias || experiencias.length === 0) {
    return <p className={emptyState}>No hay experiencias de actividad registradas.</p>;
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
          {experiencias.map((experiencia, indice) => (
            <tr
              key={experiencia.id}
              onClick={() => onSeleccionar(experiencia)}
              className={table.row(experiencia.id === seleccionadaId)}
            >
              {/* Consecutivo de fila, no el id del registro: los ids dejan de
                  ser contiguos en cuanto se da de baja alguno. */}
              <td className={table.cellMuted}>{indice + 1}</td>
              {/* `nombre` es el valor guardado en la base, no uno recalculado:
                  así se ve el dato real si un registro viejo no sigue la
                  convención que genera esta pantalla. */}
              <td className={table.cellStrong}>{experiencia.nombre}</td>
              <td className={table.cell}>
                {descripcionNivel(experiencia.catNivelRiesgoId)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
