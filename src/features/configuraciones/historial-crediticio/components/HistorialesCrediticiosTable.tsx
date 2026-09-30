import { useState, useMemo } from "react";
import { emptyState, table } from "@/shared/components/ui/styles";
import { TablePagination } from "@/shared/components/TablePagination";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { HistorialCrediticioResponse } from "../types/historialCrediticio";

interface HistorialesCrediticiosTableProps {
  historiales: HistorialCrediticioResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (historial: HistorialCrediticioResponse) => void;
  onDoubleClick?: (historial: HistorialCrediticioResponse) => void;
}

export function HistorialesCrediticiosTable({
  historiales,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: HistorialesCrediticiosTableProps) {
  const { data: niveles } = useNivelesRiesgo();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = historiales?.length ?? 0;
  const paginatedHistoriales = useMemo(() => {
    if (!historiales) return [];
    const start = page * rowsPerPage;
    return historiales.slice(start, start + rowsPerPage);
  }, [historiales, page, rowsPerPage]);

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
    return <p className={emptyState}>Cargando historiales crediticios...</p>;
  }

  if (!historiales || historiales.length === 0) {
    return <p className={emptyState}>No hay historiales crediticios registrados.</p>;
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
            {paginatedHistoriales.map((historial, indice) => (
              <tr
                key={historial.id}
                onClick={() => onSeleccionar(historial)}
                onDoubleClick={() => {
                  if (onDoubleClick) {
                    onDoubleClick(historial);
                  } else {
                    onSeleccionar(historial);
                  }
                }}
                title="Doble clic para modificar este registro"
                className={table.row(historial.id === seleccionadoId)}
              >
                <td className={table.cellMuted}>{page * rowsPerPage + indice + 1}</td>
                <td className={table.cellStrong}>{historial.nombre}</td>
                <td className={table.cell}>
                  {descripcionNivel(historial.catNivelRiesgoId)}
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
