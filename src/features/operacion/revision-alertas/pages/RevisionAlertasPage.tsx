import { useState } from "react";

import { useListaAlertas } from "@/features/alertas/hooks/useAlertas";
import type { Alerta, FiltroAlertas } from "@/features/alertas/types/alertas";
import { Alert } from "@/shared/components/ui/Alert";

import { AlertasTable } from "../components/AlertasTable";
import { DetalleAlerta } from "../components/DetalleAlerta";
import { FiltrosAlertas } from "../components/FiltrosAlertas";
import { rangoPorDefecto } from "../utils/formato";

/**
 * "Operación › Revisión de alertas" (manual Sicanet 4.3.5): manuales y las que
 * generan los movimientos de cajas. Arranca con las pendientes del último mes,
 * que son las que el oficial tiene que dictaminar.
 */
export function RevisionAlertasPage() {
  const [filtro, setFiltro] = useState<FiltroAlertas>(() => ({
    ...rangoPorDefecto(),
    estatus: "PENDIENTE",
  }));
  const [seleccionada, setSeleccionada] = useState<Alerta | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const { data: alertas, isLoading } = useListaAlertas(filtro);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Revisión de alertas</h2>
        <p className="text-muted-foreground text-sm">
          Alertas manuales y automáticas (generadas por movimientos de cajas) para
          confirmar o rechazar.
        </p>
      </div>

      <FiltrosAlertas
        inicial={filtro}
        onAplicar={(nuevo) => {
          setFiltro(nuevo);
          setSeleccionada(null);
          setAviso(null);
        }}
      />

      {aviso ? <Alert tono="exito">{aviso}</Alert> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AlertasTable
          alertas={alertas}
          isLoading={isLoading}
          seleccionadaId={seleccionada?.id ?? null}
          onSeleccionar={(alerta) => {
            setSeleccionada(alerta);
            setAviso(null);
          }}
        />
        {seleccionada ? (
          <DetalleAlerta
            alerta={seleccionada}
            onDictaminada={(alerta) => {
              setSeleccionada(alerta);
              setAviso(
                `La alerta ${alerta.folio} quedó ${alerta.estatus.toLowerCase()}.`,
              );
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
