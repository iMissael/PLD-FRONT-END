import { useState, useMemo } from "react";
import { TablePagination } from "@/shared/components/TablePagination";
import { emptyState, table } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { ExperienciaActividadResponse } from "../types/experienciaActividad";

interface ExperienciasActividadTableProps {
  experiencias: ExperienciaActividadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (experiencia: ExperienciaActividadResponse) => void;
  onDoubleClick?: (experiencia: ExperienciaActividadResponse) => void;
}

export function ExperienciasActividadTable({
  experiencias,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  onDoubleClick,
}: ExperienciasActividadTableProps) {
  // El listado solo trae `catNivelRiesgoId` (un número); la descripción se
  // resuelve cruzando con el catálogo de niveles, que ya está en caché porque
  // el formulario lo usa para su `<select>`.
  const { data: niveles } = useNivelesRiesgo();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = experiencias?.length ?? 0;
  const paginatedExperiencias = useMemo(() => {
    if (!experiencias) return [];
    const start = page * rowsPerPage;
    return experiencias.slice(start, start + rowsPerPage);
  }, [experiencias, page, rowsPerPage]);

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
    return <p className={emptyState}>Cargando experiencias de actividad...</p>;
  }

  if (!experiencias || experiencias.length === 0) {
    return <p className={emptyState}>No hay experiencias de actividad registradas.</p>;
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
            {paginatedExperiencias.map((experiencia, indice) => (
              <tr
                key={experiencia.id}
                onClick={() => onSeleccionar(experiencia)}
                onDoubleClick={() => {
                  if (onDoubleClick) onDoubleClick(experiencia);
                  else onSeleccionar(experiencia);
                }}
                title="Doble clic para modificar este registro"
                className={`${table.row(experiencia.id === seleccionadaId)} select-none`}
              >
                {/* Consecutivo de fila, no el id del registro */}
                <td className={table.cellMuted}>{page * rowsPerPage + indice + 1}</td>
                {/* `nombre` es el valor guardado en la base */}
                <td className={table.cellStrong}>{experiencia.nombre}</td>
                <td className={table.cell}>
                  {descripcionNivel(experiencia.catNivelRiesgoId)}
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
