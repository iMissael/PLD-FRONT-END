import { emptyState, table } from "@/shared/components/ui/styles";

import type { EntidadResponse } from "../types/entidad";

interface EntidadesTableProps {
  entidades: EntidadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (entidad: EntidadResponse) => void;
}

export function EntidadesTable({
  entidades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
}: EntidadesTableProps) {
  if (isLoading) {
    return <p className={emptyState}>Cargando entidades...</p>;
  }

  if (!entidades || entidades.length === 0) {
    return <p className={emptyState}>No hay entidades registradas.</p>;
  }

  return (
    <div className={table.wrapper}>
      <table className={table.root}>
        <thead className={table.head}>
          <tr>
            <th className={table.headCell}>Clave CURP</th>
            <th className={table.headCell}>Nombre</th>
            <th className={table.headCell}>País</th>
            <th className={table.headCell}>Zona</th>
            <th className={table.headCell}>Nivel de riesgo</th>
          </tr>
        </thead>
        <tbody className={table.body}>
          {entidades.map((entidad) => (
            <tr
              key={entidad.idEntidad}
              onClick={() => onSeleccionar(entidad)}
              className={table.row(entidad.idEntidad === seleccionadaId)}
            >
              <td className={table.cellStrong}>{entidad.claveCurp}</td>
              <td className={table.cell}>{entidad.nombre}</td>
              <td className={table.cell}>{entidad.nombrePais}</td>
              <td className={table.cell}>{entidad.nombreZona}</td>
              <td className={table.cell}>
                {entidad.nivelRiesgoDescripcion} ({entidad.nivelRiesgoValor})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
