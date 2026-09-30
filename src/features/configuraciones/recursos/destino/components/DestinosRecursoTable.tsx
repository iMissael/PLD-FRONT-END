import { useState, useMemo } from "react";
import { emptyState, table } from "@/shared/components/ui/styles";
import { TablePagination } from "@/shared/components/TablePagination";
import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { DestinoRecursoResponse } from "../types/destinoRecurso";

interface DestinosRecursoTableProps {
  destinos: DestinoRecursoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (destino: DestinoRecursoResponse) => void;
  onDoubleClick?: (destino: DestinoRecursoResponse) => void;
}

export function DestinosRecursoTable({
  destinos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: DestinosRecursoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = destinos?.length ?? 0;
  const paginatedDestinos = useMemo(() => {
    if (!destinos) return [];
    const start = page * rowsPerPage;
    return destinos.slice(start, start + rowsPerPage);
  }, [destinos, page, rowsPerPage]);

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
    return <p className={emptyState}>Cargando destinos de recurso...</p>;
  }

  if (!destinos || destinos.length === 0) {
    return <p className={emptyState}>No hay destinos de recurso registrados.</p>;
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
            {paginatedDestinos.map((destino, indice) => (
              <tr
                key={destino.id}
                onClick={() => onSeleccionar(destino)}
                onDoubleClick={() => {
                  if (onDoubleClick) {
                    onDoubleClick(destino);
                  } else {
                    onSeleccionar(destino);
                  }
                }}
                title="Doble clic para modificar este registro"
                className={table.row(destino.id === seleccionadoId)}
              >
                <td className={table.cellMuted}>{page * rowsPerPage + indice + 1}</td>
                <td className={table.cellStrong}>{destino.nombre}</td>
                <td className={table.cell}>{descripcionNivel(destino.catNivelRiesgoId)}</td>
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
