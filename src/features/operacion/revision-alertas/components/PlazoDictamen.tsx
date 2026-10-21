import { estatusDe, type Alerta } from "@/features/alertas/types/alertas";

import { formatearFecha, nivelPlazo, textoDiasRestantes, type NivelPlazo } from "../utils/formato";

const COLOR: Record<NivelPlazo, string> = {
  urgente: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800",
  proximo: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  holgado: "bg-muted/40 text-muted-foreground border-border",
};

/**
 * Columna "Vence" de la revisión: último día para dictaminar y cuántos días quedan, en rojo
 * con 5 días o menos y en ámbar con 10 o menos. Las ya dictaminadas, los tipos sin plazo
 * (Relevante) y, mientras el oficial define qué pasa con ellas (t58), las que ya pasaron su
 * plazo muestran un guion.
 */
export function PlazoDictamen({ alerta }: { alerta: Alerta }) {
  if (estatusDe(alerta) !== "PENDIENTE" || alerta.diasRestantes === null
      || alerta.diasRestantes === undefined || alerta.diasRestantes < 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-xs text-muted-foreground">{formatearFecha(alerta.fechaLimiteDictamen)}</span>
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${COLOR[nivelPlazo(alerta.diasRestantes)]}`}
      >
        {textoDiasRestantes(alerta.diasRestantes)}
      </span>
    </div>
  );
}
