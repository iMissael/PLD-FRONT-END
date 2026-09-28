import { table, emptyState } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { TipoPersonaResponse } from "../types/tipoPersona";

interface TiposPersonaTableProps {
  tipos: TipoPersonaResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (tipo: TipoPersonaResponse) => void;
}

export function TiposPersonaTable({
  tipos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
}: TiposPersonaTableProps) {
  // El listado solo trae `catNivelRiesgoId` (un número), así que la
  // descripción se resuelve cruzando con el catálogo de niveles, que ya está
  // en caché porque el formulario lo usa para su `<select>`.
  const { data: niveles } = useNivelesRiesgo();

  const descripcionNivel = (catNivelRiesgoId: number) => {
    const nivel = niveles?.find((item) => item.id === catNivelRiesgoId);
    if (!nivel) return String(catNivelRiesgoId);
    return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando tipos de persona...</p>;
  }

  if (!tipos || tipos.length === 0) {
    return <p className={emptyState}>No hay tipos de persona registrados.</p>;
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
          {tipos.map((tipo, indice) => (
            <tr
              key={tipo.id}
              onClick={() => onSeleccionar(tipo)}
              className={table.row(tipo.id === seleccionadoId)}
            >
              {/* Consecutivo de fila, no el id del registro: los ids dejan de
                  ser contiguos en cuanto se da de baja alguno. */}
              <td className={table.cellMuted}>{indice + 1}</td>
              <td className={table.cellStrong}>{tipo.nombre}</td>
              <td className={table.cell}>{descripcionNivel(tipo.catNivelRiesgoId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
