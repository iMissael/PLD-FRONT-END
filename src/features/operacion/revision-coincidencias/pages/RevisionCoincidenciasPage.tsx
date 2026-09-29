import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

import { PanelRevisionCoincidencia } from "../components/PanelRevisionCoincidencia";
import { TablaCoincidenciasPendientes } from "../components/TablaCoincidenciasPendientes";
import { useCoincidenciasPendientes } from "../hooks/useCoincidencias";
import type { CoincidenciaSocio } from "../types/coincidencias";

export function RevisionCoincidenciasPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useCoincidenciasPendientes();
  const [seleccionada, setSeleccionada] = useState<CoincidenciaSocio | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Revisión de coincidencias</h1>
          <p className="text-muted-foreground">
            Socios cuya evaluación de riesgo se detuvo por coincidir con una lista negra o
            de personas bloqueadas. Confirma si es la misma persona o descarta la
            coincidencia.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={isFetching ? "animate-spin" : undefined} />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <p className="py-8 text-center text-sm text-destructive">
              {isAppError(error)
                ? error.message
                : "No se pudieron cargar las coincidencias pendientes."}
            </p>
          ) : (
            <TablaCoincidenciasPendientes
              coincidencias={data}
              isLoading={isLoading}
              onRevisar={setSeleccionada}
            />
          )}
        </CardContent>
      </Card>

      <PanelRevisionCoincidencia
        coincidencia={seleccionada}
        onClose={() => setSeleccionada(null)}
      />
    </div>
  );
}
