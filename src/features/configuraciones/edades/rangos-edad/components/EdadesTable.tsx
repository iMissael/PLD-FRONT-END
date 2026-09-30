import { useState, useMemo } from "react";
import { TablePagination } from "@/shared/components/TablePagination";
import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { EdadResponse } from "../types/edad";

interface EdadesTableProps {
  edades: EdadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (edad: EdadResponse) => void;
  onDoubleClick?: (edad: EdadResponse) => void;
}

/**
 * El rango se muestra en una sola columna ("18 – 24 años") en vez de dos
 * columnas de números sueltos, que se leen peor. `edadFinal` puede venir null
 * (columna nullable), así que ese caso se rotula como rango abierto.
 */
function formatearRango(edadInicial: number, edadFinal: number | null): string {
  if (edadFinal === null) return `${edadInicial} años o más`;
  return `${edadInicial} – ${edadFinal} años`;
}

export function EdadesTable({
  edades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  onDoubleClick,
}: EdadesTableProps) {
  // El listado solo trae `catNivelRiesgoId` (un número); la descripción se
  // resuelve cruzando con el catálogo de niveles, que ya está en caché porque
  // el formulario lo usa para su `<select>`.
  const { data: niveles } = useNivelesRiesgo();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = edades?.length ?? 0;
  const paginatedEdades = useMemo(() => {
    if (!edades) return [];
    const start = page * rowsPerPage;
    return edades.slice(start, start + rowsPerPage);
  }, [edades, page, rowsPerPage]);

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
    return <p className={emptyState}>Cargando rangos de edad...</p>;
  }

  if (!edades || edades.length === 0) {
    return <p className={emptyState}>No hay rangos de edad registrados.</p>;
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
            {paginatedEdades.map((edad, indice) => (
              <tr
                key={edad.id}
                onClick={() => onSeleccionar(edad)}
                onDoubleClick={() => {
                  if (onDoubleClick) onDoubleClick(edad);
                  else onSeleccionar(edad);
                }}
                title="Doble clic para modificar este registro"
                className={`${table.row(edad.id === seleccionadaId)} select-none`}
              >
                {/* Consecutivo de fila, no el id del registro */}
                <td className={table.cellMuted}>{page * rowsPerPage + indice + 1}</td>
                <td className={table.cellStrong}>
                  {formatearRango(edad.edadInicial, edad.edadFinal)}
                </td>
                <td className={table.cell}>{descripcionNivel(edad.catNivelRiesgoId)}</td>
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
