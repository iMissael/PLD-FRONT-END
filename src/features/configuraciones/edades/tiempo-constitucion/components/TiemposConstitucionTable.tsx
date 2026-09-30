import { useState, useMemo } from "react";
import { TablePagination } from "@/shared/components/TablePagination";
import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { TiempoConstitucionResponse } from "../types/tiempoConstitucion";

interface TiemposConstitucionTableProps {
  tiempos: TiempoConstitucionResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (tiempo: TiempoConstitucionResponse) => void;
  onDoubleClick?: (tiempo: TiempoConstitucionResponse) => void;
}

export function TiemposConstitucionTable({
  tiempos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: TiemposConstitucionTableProps) {
  // El listado solo trae `catNivelRiesgoId` (un número); la descripción se
  // resuelve cruzando con el catálogo de niveles, que ya está en caché porque
  // el formulario lo usa para su `<select>`.
  const { data: niveles } = useNivelesRiesgo();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = tiempos?.length ?? 0;
  const paginatedTiempos = useMemo(() => {
    if (!tiempos) return [];
    const start = page * rowsPerPage;
    return tiempos.slice(start, start + rowsPerPage);
  }, [tiempos, page, rowsPerPage]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

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
      <div className="overflow-x-auto">
        <table className={table.root}>
          <thead className={table.head}>
            <tr>
              <th className={`w-16 ${table.headCell}`}>#</th>
              <th className={table.headCell}>Nombre</th>
              <th className={table.headCell}>Nivel de riesgo</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {paginatedTiempos.map((tiempo, indice) => (
              <tr
                key={tiempo.id}
                onClick={() => onSeleccionar(tiempo)}
                onDoubleClick={() => {
                  if (onDoubleClick) onDoubleClick(tiempo);
                  else onSeleccionar(tiempo);
                }}
                title="Doble clic para modificar este registro"
                className={`${table.row(tiempo.id === seleccionadoId)} select-none`}
              >
                {/* Consecutivo de fila, no el id del registro */}
                <td className={table.cellMuted}>{page * rowsPerPage + indice + 1}</td>
                {/* `nombre` es el valor guardado en la base */}
                <td className={table.cellStrong}>{tiempo.nombre}</td>
                <td className={table.cell}>{descripcionNivel(tiempo.catNivelRiesgoId)}</td>
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
