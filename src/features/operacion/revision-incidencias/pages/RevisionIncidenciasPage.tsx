import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

import { PanelRevisionIncidencia } from "../components/PanelRevisionIncidencia";
import { TablaIncidenciasPendientes } from "../components/TablaIncidenciasPendientes";
import { useIncidenciasPendientes } from "../hooks/useIncidencias";
import type { CoincidenciaSocio } from "../types/incidencias";

export function RevisionIncidenciasPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useIncidenciasPendientes();
  const [seleccionada, setSeleccionada] = useState<CoincidenciaSocio | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Revisión de Incidencias</h1>
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
            <TablaIncidenciasPendientes
              coincidencias={data}
              isLoading={isLoading}
              socioRefSeleccionado={seleccionada?.socio_ref}
              onRevisar={setSeleccionada}
            />
          )}
        </CardContent>
      </Card>

      <PanelRevisionIncidencia
        coincidencia={seleccionada}
        onClose={() => setSeleccionada(null)}
      />
    </div>
  );
}
