import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { emptyState, table } from "@/shared/components/ui/styles";
import { TablePagination } from "@/shared/components/ui/TablePagination";

import type { EstatusAutorizacion, RevisionAutorizacion } from "../types/autorizaciones";
import {
  ETIQUETA_ESTATUS_AUTORIZACION,
  formatearFechaHora,
} from "../utils/formatoAutorizacion";

const TONO: Record<EstatusAutorizacion, "activo" | "inactivo" | "neutro"> = {
  AUTORIZADO: "activo",
  RECHAZADO: "inactivo",
  CANCELADO: "neutro",
};

interface AutorizacionesTableProps {
  autorizaciones: RevisionAutorizacion[] | undefined;
  consultado: boolean;
  isLoading: boolean;
  seleccionadaId: number | null;
  onSeleccionar: (autorizacion: RevisionAutorizacion) => void;
  pagina: number;
  tamanio: number;
  totalElementos: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarTamanio: (tamanio: number) => void;
}

export function AutorizacionesTable({
  autorizaciones,
  consultado,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  pagina,
  tamanio,
  totalElementos,
  onCambiarPagina,
  onCambiarTamanio,
}: AutorizacionesTableProps) {
  if (!consultado) {
    return (
      <p className={emptyState}>
        Elige el rango de fechas y los estatus y presiona Consultar.
      </p>
    );
  }
  if (isLoading) return <p className={emptyState}>Cargando alertas de autorización...</p>;
  if (!autorizaciones || autorizaciones.length === 0) {
    return (
      <p className={emptyState}>No hay alertas de autorización con estos filtros.</p>
    );
  }

  return (
    <div className={table.wrapper}>
      <div className="overflow-x-auto">
        <table className={table.root}>
          <thead className={table.head}>
            <tr>
              <th className={table.headCell}>#</th>
              <th className={table.headCell}>Tipo de movimiento</th>
              <th className={table.headCell}>Fecha autorización</th>
              <th className={table.headCell}>Empleado solicitante</th>
              <th className={table.headCell}>Empleado autorizante</th>
              <th className={table.headCell}>Estatus asignado</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {autorizaciones.map((a, indice) => (
              <tr
                key={a.id}
                onClick={() => onSeleccionar(a)}
                className={table.row(a.id === seleccionadaId)}
              >
                <td className={table.cellStrong}>{pagina * tamanio + indice + 1}</td>
                <td className={table.cell}>{a.movimiento?.tipoMovimiento ?? "—"}</td>
                <td className={table.cellMuted}>
                  {formatearFechaHora(a.autorizacion.fecha)}
                </td>
                <td className={table.cell}>
                  {a.solicitud.nombreEmpleado ?? a.solicitud.usuario ?? "—"}
                </td>
                <td className={table.cell}>
                  {a.autorizacion.nombreEmpleado ?? a.autorizacion.usuario ?? "—"}
                </td>
                <td className={table.cell}>
                  <Badge tono={TONO[a.estatus]}>
                    {ETIQUETA_ESTATUS_AUTORIZACION[a.estatus]}
                  </Badge>
                </td>
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
