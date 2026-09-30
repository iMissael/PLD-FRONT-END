import { useState, useMemo } from "react";
import { TablePagination } from "@/shared/components/TablePagination";
import { emptyState, table } from "@/shared/components/ui/styles";

import type { PaisResponse } from "../types/pais";

interface PaisesTableProps {
  paises: PaisResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  /** Mapa idZona -> nombreZona, para mostrar el nombre en vez del id crudo. */
  nombresDeZona: Record<string, string>;
  onSeleccionar: (pais: PaisResponse) => void;
  onDoubleClick?: (pais: PaisResponse) => void;
}

/**
 * Tabla de países, con el mismo layout de columnas que la pantalla legacy
 * de escritorio ("Configuración de Países"): Clave, País y PLD Zona
 * Geográfica. Un país puede tener varias zonas asignadas (el legacy solo
 * manejaba una), así que aquí se muestran separadas por coma.
 */
export function PaisesTable({
  paises,
  isLoading,
  seleccionadoId,
  nombresDeZona,
  onSeleccionar,
  onDoubleClick,
}: PaisesTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalElements = paises?.length ?? 0;
  const paginatedPaises = useMemo(() => {
    if (!paises) return [];
    const start = page * rowsPerPage;
    return paises.slice(start, start + rowsPerPage);
  }, [paises, page, rowsPerPage]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando países...</p>;
  }

  if (!paises || paises.length === 0) {
    return <p className={emptyState}>No hay países registrados.</p>;
  }

  return (
    <div className={table.wrapper}>
      <div className="overflow-x-auto">
        <table className={table.root}>
          <thead className={table.head}>
            <tr>
              <th className={table.headCell}>Clave</th>
              <th className={table.headCell}>País</th>
              <th className={table.headCell}>PLD Zona Geográfica</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {paginatedPaises.map((pais) => {
              const nombresZonas = pais.zonasAsignadas
                .map((id) => nombresDeZona[id])
                .filter((nombre): nombre is string => Boolean(nombre));

              return (
                <tr
                  key={pais.idPais}
                  onClick={() => onSeleccionar(pais)}
                  onDoubleClick={() => {
                    if (onDoubleClick) onDoubleClick(pais);
                    else onSeleccionar(pais);
                  }}
                  title="Doble clic para modificar este registro"
                  className={`${table.row(pais.idPais === seleccionadoId)} select-none`}
                >
                  <td className={table.cellStrong}>{pais.idPais}</td>
                  <td className={table.cell}>{pais.nombre}</td>
                  <td className={table.cell}>
                    {nombresZonas.length > 0 ? nombresZonas.join(", ") : "—"}
                  </td>
                </tr>
              );
            })}
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
