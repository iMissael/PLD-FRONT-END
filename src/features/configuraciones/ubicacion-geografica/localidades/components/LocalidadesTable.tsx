import { emptyState, table } from "@/shared/components/ui/styles";

import type { LocalidadResponse } from "../types/localidad";

interface LocalidadesTableProps {
  localidades: LocalidadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (localidad: LocalidadResponse) => void;
}

export function LocalidadesTable({
  localidades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
}: LocalidadesTableProps) {
  if (isLoading) {
    return <p className={emptyState}>Cargando localidades...</p>;
  }

  if (!localidades || localidades.length === 0) {
    return (
      <p className={emptyState}>No hay localidades que coincidan con los filtros.</p>
    );
  }

  return (
    <div className={table.wrapper}>
      <table className={table.root}>
        <thead className={table.head}>
          <tr>
            <th className={table.headCell}>Nombre</th>
            <th className={table.headCell}>Municipio</th>
            <th className={table.headCell}>Tipo de asentamiento</th>
            <th className={table.headCell}>Nivel de riesgo</th>
          </tr>
        </thead>
        <tbody className={table.body}>
          {localidades.map((localidad) => (
            <tr
              key={localidad.idLocalidad}
              onClick={() => onSeleccionar(localidad)}
              className={table.row(localidad.idLocalidad === seleccionadaId)}
            >
              <td className={table.cellStrong}>{localidad.nombre}</td>
              <td className={table.cell}>{localidad.nombreMunicipio}</td>
              <td className={table.cell}>{localidad.tipoAsentamiento}</td>
              <td className={table.cell}>
                {localidad.nivelRiesgoDescripcion} ({localidad.nivelRiesgoValor})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
