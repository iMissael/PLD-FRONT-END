import {
  ETIQUETA_ESTATUS,
  type Alerta,
  type EstatusAlerta,
} from "@/features/alertas/types/alertas";
import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { emptyState, table } from "@/shared/components/ui/styles";

import { formatearFecha } from "../utils/formato";

const TONO: Record<EstatusAlerta, "activo" | "inactivo" | "neutro"> = {
  PENDIENTE: "neutro",
  CONFIRMADA: "activo",
  RECHAZADA: "inactivo",
  REPORTADA: "activo",
};

interface AlertasTableProps {
  alertas: Alerta[] | undefined;
  isLoading: boolean;
  seleccionadaId: number | null;
  onSeleccionar: (alerta: Alerta) => void;
}

export function AlertasTable({
  alertas,
  isLoading,
  seleccionadaId,
  onSeleccionar,
}: AlertasTableProps) {
  if (isLoading) return <p className={emptyState}>Cargando alertas...</p>;
  if (!alertas || alertas.length === 0) {
    return <p className={emptyState}>No hay alertas con estos filtros.</p>;
  }

  return (
    <div className={`${table.wrapper} overflow-x-auto`}>
      <table className={table.root}>
        <thead className={table.head}>
          <tr>
            <th className={table.headCell}>Folio</th>
            <th className={table.headCell}>Fecha</th>
            <th className={table.headCell}>Tipo</th>
            <th className={table.headCell}>Referencia</th>
            <th className={table.headCell}>Reportado</th>
            <th className={table.headCell}>Origen</th>
            <th className={table.headCell}>Estatus</th>
          </tr>
        </thead>
        <tbody className={table.body}>
          {alertas.map((alerta) => (
            <tr
              key={alerta.id}
              onClick={() => onSeleccionar(alerta)}
              className={table.row(alerta.id === seleccionadaId)}
            >
              <td className={table.cellStrong}>{alerta.folio}</td>
              <td className={table.cellMuted}>{formatearFecha(alerta.fechaAlerta)}</td>
              <td className={table.cell}>{alerta.tipoAlertaDescripcion}</td>
              <td className={table.cellMuted}>{alerta.reportado?.referencia ?? "—"}</td>
              <td className={table.cell}>{alerta.reportado?.nombre ?? "—"}</td>
              <td className={table.cellMuted}>
                {alerta.origen === "AUTOMATICA" ? "Automática" : "Manual"}
              </td>
              <td className={table.cell}>
                <Badge tono={TONO[alerta.estatus]}>
                  {ETIQUETA_ESTATUS[alerta.estatus]}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
