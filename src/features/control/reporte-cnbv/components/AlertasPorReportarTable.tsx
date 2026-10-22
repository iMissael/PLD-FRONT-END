import { Eye } from "lucide-react";

import type { Alerta } from "@/features/alertas/types/alertas";
import { formatearFecha } from "@/features/operacion/revision-alertas/utils/formato";
import { Button } from "@/shared/components/atoms/Button";
import { emptyState, table } from "@/shared/styles/tokens";

import {
  nivelPlazoReporte,
  textoDiasHabilesReporte,
  type NivelPlazoReporte,
} from "../utils/plazoReporte";

const COLOR: Record<NivelPlazoReporte, string> = {
  vencido: "bg-red-600 text-white border-red-700 dark:bg-red-700 dark:border-red-600",
  urgente:
    "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800",
  proximo:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  holgado: "bg-muted/40 text-muted-foreground border-border",
};

function PlazoReporte({ alerta }: { alerta: Alerta }) {
  if (alerta.diasHabilesRestantesReporte === null || !alerta.fechaLimiteReporte) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-xs text-muted-foreground">
        {formatearFecha(alerta.fechaLimiteReporte)}
      </span>
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${COLOR[nivelPlazoReporte(alerta.diasHabilesRestantesReporte)]}`}
      >
        {textoDiasHabilesReporte(alerta.diasHabilesRestantesReporte)}
      </span>
    </div>
  );
}

interface AlertasPorReportarTableProps {
  alertas: Alerta[];
  onPrevisualizar: (alertaId: number) => void;
}

export function AlertasPorReportarTable({ alertas, onPrevisualizar }: AlertasPorReportarTableProps) {
  if (alertas.length === 0) {
    return <div className={emptyState}>No hay alertas por reportar con este filtro.</div>;
  }
  return (
    <div className={table.wrapper}>
      <div className="overflow-x-auto">
        <table className={table.root}>
          <thead className={table.head}>
            <tr>
              <th className={table.headCell}>Folio</th>
              <th className={table.headCell}>Tipo</th>
              <th className={table.headCell}>Reportado</th>
              <th className={table.headCell}>Fecha alerta</th>
              <th className={table.headCell}>Dictamen</th>
              <th className={table.headCell}>Descripción</th>
              <th className={table.headCell}>Reportar antes de</th>
              <th className={table.headCell}>Reporte CNBV</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {alertas.map((alerta) => (
              <tr
                key={alerta.id}
                className={
                  (alerta.diasHabilesRestantesReporte ?? 0) < 0
                    ? "bg-red-50/70 dark:bg-red-950/20"
                    : undefined
                }
              >
                <td className={table.cellStrong}>{alerta.folio}</td>
                <td className={table.cell}>{alerta.tipoAlertaDescripcion}</td>
                <td className={table.cell}>
                  <div className="flex flex-col">
                    <span>{alerta.reportado?.nombre ?? "—"}</span>
                    <span className="text-muted-foreground text-xs">
                      {alerta.reportado?.referencia}
                    </span>
                  </div>
                </td>
                <td className={table.cellMuted}>{formatearFecha(alerta.fechaAlerta)}</td>
                <td className={table.cellMuted}>
                  {formatearFecha(alerta.fechaDictamen)}
                </td>
                <td className={`${table.cell} max-w-md`}>
                  <span
                    className="line-clamp-2"
                    title={alerta.descripcion ?? alerta.actoHecho ?? undefined}
                  >
                    {alerta.descripcion ?? alerta.actoHecho ?? "—"}
                  </span>
                </td>
                <td className={table.cell}>
                  <PlazoReporte alerta={alerta} />
                </td>
                <td className={table.cell}>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Previsualizar reporte CNBV"
                    title="Previsualizar reporte CNBV"
                    onClick={() => onPrevisualizar(alerta.id)}
                  >
                    <Eye className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
