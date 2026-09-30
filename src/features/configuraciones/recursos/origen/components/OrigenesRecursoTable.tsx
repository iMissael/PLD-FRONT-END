import { useState, useMemo } from "react";
import { emptyState, table } from "@/shared/components/ui/styles";
import { TablePagination } from "@/shared/components/TablePagination";
import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { OrigenRecursoResponse } from "../types/origenRecurso";

interface OrigenesRecursoTableProps {
  origenes: OrigenRecursoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (origen: OrigenRecursoResponse) => void;
  onDoubleClick?: (origen: OrigenRecursoResponse) => void;
}

export function OrigenesRecursoTable({
  origenes,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: OrigenesRecursoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = origenes?.length ?? 0;
  const paginatedOrigenes = useMemo(() => {
    if (!origenes) return [];
    const start = page * rowsPerPage;
    return origenes.slice(start, start + rowsPerPage);
  }, [origenes, page, rowsPerPage]);

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
    return <p className={emptyState}>Cargando orígenes de recurso...</p>;
  }

  if (!origenes || origenes.length === 0) {
    return <p className={emptyState}>No hay orígenes de recurso registrados.</p>;
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
            {paginatedOrigenes.map((origen, indice) => (
              <tr
                key={origen.id}
                onClick={() => onSeleccionar(origen)}
                onDoubleClick={() => {
                  if (onDoubleClick) {
                    onDoubleClick(origen);
                  } else {
                    onSeleccionar(origen);
                  }
                }}
                title="Doble clic para modificar este registro"
                className={table.row(origen.id === seleccionadoId)}
              >
                <td className={table.cellMuted}>{page * rowsPerPage + indice + 1}</td>
                <td className={table.cellStrong}>{origen.nombre}</td>
                <td className={table.cell}>{descripcionNivel(origen.catNivelRiesgoId)}</td>
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
