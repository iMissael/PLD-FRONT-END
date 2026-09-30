import { useState, useMemo } from "react";
import { TablePagination } from "@/shared/components/TablePagination";
import { table, emptyState } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { TipoPersonaResponse } from "../types/tipoPersona";

interface TiposPersonaTableProps {
  tipos: TipoPersonaResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (tipo: TipoPersonaResponse) => void;
  onDoubleClick?: (tipo: TipoPersonaResponse) => void;
}

export function TiposPersonaTable({
  tipos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: TiposPersonaTableProps) {
  // El listado solo trae `catNivelRiesgoId` (un número), así que la
  // descripción se resuelve cruzando con el catálogo de niveles, que ya está
  // en caché porque el formulario lo usa para su `<select>`.
  const { data: niveles } = useNivelesRiesgo();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = tipos?.length ?? 0;
  const paginatedTipos = useMemo(() => {
    if (!tipos) return [];
    const start = page * rowsPerPage;
    return tipos.slice(start, start + rowsPerPage);
  }, [tipos, page, rowsPerPage]);

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
    return <p className={emptyState}>Cargando tipos de persona...</p>;
  }

  if (!tipos || tipos.length === 0) {
    return <p className={emptyState}>No hay tipos de persona registrados.</p>;
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
            {paginatedTipos.map((tipo, indice) => (
              <tr
                key={tipo.id}
                onClick={() => onSeleccionar(tipo)}
                onDoubleClick={() => {
                  if (onDoubleClick) onDoubleClick(tipo);
                  else onSeleccionar(tipo);
                }}
                title="Doble clic para modificar este registro"
                className={`${table.row(tipo.id === seleccionadoId)} select-none`}
              >
                {/* Consecutivo de fila, no el id del registro */}
                <td className={table.cellMuted}>{page * rowsPerPage + indice + 1}</td>
                <td className={table.cellStrong}>{tipo.nombre}</td>
                <td className={table.cell}>{descripcionNivel(tipo.catNivelRiesgoId)}</td>
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
