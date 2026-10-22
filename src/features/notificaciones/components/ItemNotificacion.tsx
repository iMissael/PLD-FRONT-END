import { CalendarClock, FileWarning, Send } from "lucide-react";

import type { Notificacion, TipoNotificacion } from "../types/notificaciones";
import { tiempoRelativo } from "../utils/tiempoRelativo";

const ICONO: Record<TipoNotificacion, typeof Send> = {
  REPORTE_CNBV: Send,
  DICTAMEN_POR_VENCER: FileWarning,
  TRIMESTRAL_RELEVANTES: CalendarClock,
};

interface ItemNotificacionProps {
  notificacion: Notificacion;
  onAbrir: (notificacion: Notificacion) => void;
}

export function ItemNotificacion({ notificacion, onAbrir }: ItemNotificacionProps) {
  const Icono = ICONO[notificacion.tipo] ?? Send;
  return (
    <button
      type="button"
      onClick={() => onAbrir(notificacion)}
      className={`hover:bg-muted/50 flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        notificacion.leida ? "opacity-70" : "bg-primary/5"
      }`}
    >
      <span className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
        <Icono className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
          {notificacion.titulo}
          {!notificacion.leida ? (
            <span
              className="bg-primary size-2 shrink-0 rounded-full"
              aria-label="Sin leer"
            />
          ) : null}
        </span>
        <span className="text-muted-foreground text-xs leading-snug">
          {notificacion.mensaje}
        </span>
        <span className="text-muted-foreground/80 text-[11px]">
          {tiempoRelativo(notificacion.creadaEn)}
        </span>
      </span>
    </button>
  );
}
