import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/atoms/Button";
import { Card, CardContent } from "@/shared/components/molecules/Card";

import { PanelRevisionIncidencia } from "../components/PanelRevisionIncidencia";
import { TablaIncidenciasPendientes } from "../components/TablaIncidenciasPendientes";
import { useIncidenciasPendientes, useSincronizarAcreditados } from "../hooks/useIncidencias";
import type { ResultadoSincronizacion } from "../api/incidenciasApi";
import type { CoincidenciaAcreditado } from "../types/incidencias";

export function RevisionIncidenciasPage() {
  const { data, isLoading, isError, error, isFetching } =
    useIncidenciasPendientes();
  const [seleccionada, setSeleccionada] = useState<CoincidenciaAcreditado | null>(null);
  const sincronizacion = useSincronizarAcreditados();
  const actualizando = isFetching || sincronizacion.isPending;

  // Antes de recargar se buscan acreditados nuevos en el sistema externo y se escanean; si eso falla
  // (sin permiso o servicio caido) igual se recarga lo que ya hay.
  function actualizar() {
    sincronizacion.mutate(undefined, {
      onSuccess: (resultado) => toast.info(resumenSincronizacion(resultado)),
      onError: (e) =>
        toast.warning(
          `No se pudieron revisar acreditados nuevos${isAppError(e) ? `: ${e.message}` : ""}. Se muestran las incidencias que ya hay.`,
        ),
    });
  }

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
        <Button variant="outline" onClick={actualizar} disabled={actualizando}>
          <RefreshCw className={actualizando ? "animate-spin" : undefined} />
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

function resumenSincronizacion(r: ResultadoSincronizacion) {
  if (!r.disponible) return "El sistema de acreditados no respondió; se muestran las incidencias que ya hay.";
  const partes = [`${r.total} acreditados revisados`];
  if (r.nuevos) partes.push(`${r.nuevos} nuevos`);
  if (r.escaneados) partes.push(`${r.escaneados} escaneados contra listas`);
  if (r.errores) partes.push(`${r.errores} con error`);
  return partes.join(", ") + ".";
}
