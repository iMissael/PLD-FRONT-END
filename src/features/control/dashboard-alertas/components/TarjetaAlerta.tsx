import { Card } from "@/shared/components/molecules";

import type { TarjetaDashboardAlertas } from "../types/dashboardAlertas";

interface TarjetaAlertaProps {
  tarjeta: TarjetaDashboardAlertas;
}

/** Una tarjeta del dashboard: total grande, nombre del tipo, y su desglose ("No aplica" si no tiene). */
export function TarjetaAlerta({ tarjeta }: TarjetaAlertaProps) {
  return (
    <Card className="gap-3 py-5 text-center">
      <span className="text-foreground text-4xl font-bold tabular-nums">
        {tarjeta.total.toLocaleString("es-MX")}
      </span>
      <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {tarjeta.descripcion}
      </span>
      <div className="border-border mx-4 flex items-center justify-center gap-3 rounded-full border px-3 py-1.5 text-xs font-medium">
        {tarjeta.desglose.length === 0 ? (
          <span className="text-muted-foreground">No aplica</span>
        ) : (
          tarjeta.desglose.map((c) => (
            <span key={c.etiqueta} className="text-foreground">
              {c.etiqueta}: {c.cantidad.toLocaleString("es-MX")}
            </span>
          ))
        )}
      </div>
    </Card>
  );
}
