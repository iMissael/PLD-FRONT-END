import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/atoms/Button";
import { Card, CardContent } from "@/shared/components/molecules/Card";

import { PanelRevisionIncidencia } from "../components/PanelRevisionIncidencia";
import { TablaIncidenciasPendientes } from "../components/TablaIncidenciasPendientes";
import { useIncidenciasPendientes } from "../hooks/useIncidencias";
import type { CoincidenciaAcreditado } from "../types/incidencias";

export function RevisionIncidenciasPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useIncidenciasPendientes();
  const [seleccionada, setSeleccionada] = useState<CoincidenciaAcreditado | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Revisión de Incidencias</h1>
          <p className="text-muted-foreground">
            Acreditados con alguna coincidencia detectada: en lista negra o de personas bloqueadas,
            en riesgo-país, con otro acreditado de nombre parecido, o con una persona relacionada.
            Confirma o descarta cada una; el registro se queda en la tabla con su estatus.
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
                : "No se pudieron cargar las incidencias."}
            </p>
          ) : (
            <TablaIncidenciasPendientes
              coincidencias={data}
              isLoading={isLoading}
              acreditadoRefSeleccionado={seleccionada?.acreditado_ref}
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
