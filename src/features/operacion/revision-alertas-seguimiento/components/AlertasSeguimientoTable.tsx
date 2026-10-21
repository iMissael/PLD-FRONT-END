import type { Alerta } from "@/features/alertas/types/alertas";
import { formatearFecha } from "@/features/operacion/revision-alertas/utils/formato";
import { TablePagination } from "@/shared/components/molecules/TablePagination";
import { emptyState, table } from "@/shared/styles/tokens";

interface AlertasSeguimientoTableProps {
  consultado: boolean;
  alertas: Alerta[] | undefined;
  isLoading: boolean;
  seleccionadaId: number | null;
  onSeleccionar: (alerta: Alerta) => void;
  pagina: number;
  tamanio: number;
  totalElementos: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarTamanio: (tamanio: number) => void;
}

export function AlertasSeguimientoTable({
  consultado,
  alertas,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  pagina,
  tamanio,
  totalElementos,
  onCambiarPagina,
  onCambiarTamanio,
}: AlertasSeguimientoTableProps) {
  if (!consultado) {
    return <p className={emptyState}>Elige un cliente o un rango de fechas y presiona Consultar.</p>;
  }
  if (isLoading) return <p className={emptyState}>Cargando alertas de seguimiento...</p>;
  if (!alertas || alertas.length === 0) {
    return <p className={emptyState}>No hay alertas de seguimiento con estos filtros.</p>;
  }

  return (
    <div className={table.wrapper}>
      <div className="overflow-x-auto">
        <table className={table.root}>
          <thead className={table.head}>
            <tr>
              <th className={table.headCell}>#</th>
              <th className={table.headCell}>Folio</th>
              <th className={table.headCell}>Fecha</th>
              <th className={table.headCell}>Nombre</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {alertas.map((alerta, indice) => (
              <tr
                key={alerta.id}
                onClick={() => onSeleccionar(alerta)}
                className={table.row(alerta.id === seleccionadaId)}
              >
                <td className={table.cellStrong}>{pagina * tamanio + indice + 1}</td>
                <td className={table.cellStrong}>{alerta.folio}</td>
                <td className={table.cellMuted}>{formatearFecha(alerta.fechaAlerta)}</td>
                <td className={table.cell}>{alerta.reportado?.nombre ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        count={totalElementos}
        page={pagina}
        rowsPerPage={tamanio}
        onPageChange={(_, nuevaPagina) => onCambiarPagina(nuevaPagina)}
        onRowsPerPageChange={(e) => onCambiarTamanio(Number(e.target.value))}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </div>
  );
}
