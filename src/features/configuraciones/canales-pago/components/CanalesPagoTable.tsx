import { useState, useMemo } from "react";
import { emptyState, table } from "@/shared/components/ui/styles";
import { TablePagination } from "@/shared/components/TablePagination";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { CanalPagoResponse } from "../types/canalPago";

interface CanalesPagoTableProps {
  canales: CanalPagoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (canal: CanalPagoResponse) => void;
  onDoubleClick?: (canal: CanalPagoResponse) => void;
}

export function CanalesPagoTable({
  canales,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: CanalesPagoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = canales?.length ?? 0;
  const paginatedCanales = useMemo(() => {
    if (!canales) return [];
    const start = page * rowsPerPage;
    return canales.slice(start, start + rowsPerPage);
  }, [canales, page, rowsPerPage]);

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
    return <p className={emptyState}>Cargando canales de pago...</p>;
  }

  if (!canales || canales.length === 0) {
    return <p className={emptyState}>No hay canales de pago registrados.</p>;
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
            {paginatedCanales.map((canal, indice) => (
              <tr
                key={canal.id}
                onClick={() => onSeleccionar(canal)}
                onDoubleClick={() => {
                  if (onDoubleClick) {
                    onDoubleClick(canal);
                  } else {
                    onSeleccionar(canal);
                  }
                }}
                title="Doble clic para modificar este registro"
                className={table.row(canal.id === seleccionadoId)}
              >
                <td className={table.cellMuted}>{page * rowsPerPage + indice + 1}</td>
                <td className={table.cellStrong}>{canal.nombre}</td>
                <td className={table.cell}>{descripcionNivel(canal.catNivelRiesgoId)}</td>
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
