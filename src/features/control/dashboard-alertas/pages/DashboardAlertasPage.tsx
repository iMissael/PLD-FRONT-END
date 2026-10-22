import { Alert } from "@/shared/components/molecules";
import { emptyState } from "@/shared/styles/tokens";

import { TarjetaAlerta } from "../components/TarjetaAlerta";
import { useDashboardAlertas } from "../hooks/useDashboardAlertas";

/**
 * "Control › Dashboard de alertas" (pantalla homónima de Sicanet): una tarjeta por tipo de alerta
 * con su total y desglose por estatus.
 */
export function DashboardAlertasPage() {
  const { data, isLoading, isError } = useDashboardAlertas();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Dashboard de alertas</h2>
        <p className="text-muted-foreground text-sm">
          Total y desglose de alertas por tipo.
        </p>
      </div>

      {isError ? <Alert>No se pudo cargar el dashboard de alertas.</Alert> : null}
      {isLoading ? (
        <p className={emptyState}>Cargando…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((tarjeta) => (
            <TarjetaAlerta key={tarjeta.acronimo} tarjeta={tarjeta} />
          ))}
        </div>
      )}
    </div>
  );
}
