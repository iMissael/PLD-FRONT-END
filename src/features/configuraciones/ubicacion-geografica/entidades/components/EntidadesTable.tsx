import { useState, useMemo } from "react";
import { TablePagination } from "@/shared/components/TablePagination";
import { emptyState, table } from "@/shared/components/ui/styles";

import type { EntidadResponse } from "../types/entidad";

interface EntidadesTableProps {
  entidades: EntidadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (entidad: EntidadResponse) => void;
  onDoubleClick?: (entidad: EntidadResponse) => void;
}

export function EntidadesTable({
  entidades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  onDoubleClick,
}: EntidadesTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = entidades?.length ?? 0;
  const paginatedEntidades = useMemo(() => {
    if (!entidades) return [];
    const start = page * rowsPerPage;
    return entidades.slice(start, start + rowsPerPage);
  }, [entidades, page, rowsPerPage]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando entidades...</p>;
  }

  if (!entidades || entidades.length === 0) {
    return <p className={emptyState}>No hay entidades registradas.</p>;
  }

  return (
    <div className={table.wrapper}>
      <div className="overflow-x-auto">
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
            {paginatedEntidades.map((entidad) => (
              <tr
                key={entidad.idEntidad}
                onClick={() => onSeleccionar(entidad)}
                onDoubleClick={() => {
                  if (onDoubleClick) onDoubleClick(entidad);
                  else onSeleccionar(entidad);
                }}
                title="Doble clic para modificar este registro"
                className={`${table.row(entidad.idEntidad === seleccionadaId)} select-none`}
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
