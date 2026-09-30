import { useState, useMemo } from "react";
import { emptyState, table } from "@/shared/components/ui/styles";
import { TablePagination } from "@/shared/components/TablePagination";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { PrestamoMontoResponse } from "../types/prestamoMonto";
import { formatearRangoMonto } from "../utils/nombreMonto";

interface PrestamosMontoTableProps {
  rangos: PrestamoMontoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (rango: PrestamoMontoResponse) => void;
  onDoubleClick?: (rango: PrestamoMontoResponse) => void;
}

export function PrestamosMontoTable({
  rangos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: PrestamosMontoTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = rangos?.length ?? 0;
  const paginatedRangos = useMemo(() => {
    if (!rangos) return [];
    const start = page * rowsPerPage;
    return rangos.slice(start, start + rowsPerPage);
  }, [rangos, page, rowsPerPage]);

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
    return <p className={emptyState}>Cargando rangos de monto...</p>;
  }

  if (!rangos || rangos.length === 0) {
    return <p className={emptyState}>No hay rangos de monto registrados.</p>;
  }

  return (
    <div className={table.wrapper}>
      <div className="overflow-x-auto">
        <table className={table.root}>
          <thead className={table.head}>
            <tr>
              <th className={`w-16 ${table.headCell}`}>#</th>
              <th className={table.headCell}>Rango</th>
              <th className={table.headCell}>Nivel de riesgo</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {paginatedRangos.map((rango, indice) => (
              <tr
                key={rango.id}
                onClick={() => onSeleccionar(rango)}
                onDoubleClick={() => {
                  if (onDoubleClick) {
                    onDoubleClick(rango);
                  } else {
                    onSeleccionar(rango);
                  }
                }}
                title="Doble clic para modificar este registro"
                className={table.row(rango.id === seleccionadoId)}
              >
                <td className={table.cellMuted}>{page * rowsPerPage + indice + 1}</td>
                <td className={table.cellStrong}>
                  {formatearRangoMonto(rango.montoMin, rango.montoMax)}
                </td>
                <td className={table.cell}>{descripcionNivel(rango.catNivelRiesgoId)}</td>
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
