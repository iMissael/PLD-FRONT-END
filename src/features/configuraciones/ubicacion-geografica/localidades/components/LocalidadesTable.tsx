import { useState, useMemo } from "react";
import { TablePagination } from "@/shared/components/TablePagination";
import { emptyState, table } from "@/shared/components/ui/styles";

import type { LocalidadResponse } from "../types/localidad";

interface LocalidadesTableProps {
  localidades: LocalidadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (localidad: LocalidadResponse) => void;
  onDoubleClick?: (localidad: LocalidadResponse) => void;
}

export function LocalidadesTable({
  localidades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  onDoubleClick,
}: LocalidadesTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = localidades?.length ?? 0;
  const paginatedLocalidades = useMemo(() => {
    if (!localidades) return [];
    const start = page * rowsPerPage;
    return localidades.slice(start, start + rowsPerPage);
  }, [localidades, page, rowsPerPage]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

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
      <div className="overflow-x-auto">
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
            {paginatedLocalidades.map((localidad) => (
              <tr
                key={localidad.idLocalidad}
                onClick={() => onSeleccionar(localidad)}
                onDoubleClick={() => {
                  if (onDoubleClick) onDoubleClick(localidad);
                  else onSeleccionar(localidad);
                }}
                title="Doble clic para modificar este registro"
                className={`${table.row(localidad.idLocalidad === seleccionadaId)} select-none`}
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

      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </div>
  );
}
