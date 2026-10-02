import { useState } from "react";
import { toast } from "sonner";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import { NivelRiesgoSelect } from "@/features/configuraciones/ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import { Button } from "@/shared/components/ui/button";
import type { EvaluacionMostrada } from "@/features/operacion/evaluacion-riesgo/components/MatrizRiesgoDashboard";
import { useModificarNivelRiesgo } from "@/features/operacion/evaluacion-riesgo/hooks/useEvaluacionRiesgo";
import { useEvaluacionesSesionStore } from "@/features/operacion/evaluacion-riesgo/stores/evaluacionesSesionStore";
import type { ClienteMatrizRiesgo } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";

/**
 * Panel "Modificación de riesgo" (formato de la captura de referencia): opera sobre la
 * evaluación que está mostrando la Matriz de Riesgo Integral (el socio elegido con la lupa).
 * Permite asignarle un nivel de riesgo distinto al calculado, con una observación que
 * justifique el cambio. El nivel calculado original no se pierde.
 */
export function PanelModificacionRiesgo({
  evaluacion,
  cliente,
}: {
  evaluacion: EvaluacionMostrada;
  cliente: ClienteMatrizRiesgo;
}) {
  const resultado = evaluacion.resultado;
  const [nivelId, setNivelId] = useState<number | "">("");
  const [observaciones, setObservaciones] = useState("");
  const modificar = useModificarNivelRiesgo();

  const observacionesLimpias = observaciones.trim();

  const handleSubmit = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (nivelId === "" || observacionesLimpias === "" || resultado.id_evaluacion == null) return;

    modificar.mutate(
      {
        llaveSeguimiento: resultado.id_evaluacion,
        input: {
          cat_nivel_riesgo_id: nivelId,
          observaciones: observacionesLimpias,
        },
      },
      {
        onSuccess: (nuevoResultado) => {
          useEvaluacionesSesionStore
            .getState()
            .guardar(cliente.referencia, { ...evaluacion, cliente, resultado: nuevoResultado });
          toast.success("Nivel de riesgo modificado.");
          setNivelId("");
          setObservaciones("");
        },
        onError: (error) => {
          toast.error(
            isAppError(error) ? error.message : "No se pudo modificar el nivel de riesgo.",
          );
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Evaluación <span className="font-semibold text-foreground">#{resultado.id_evaluacion}</span> de{" "}
        <span className="font-semibold text-foreground">{cliente.nombre}</span>
      </p>

      {resultado.nivel_riesgo_manual && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            Nivel manual asignado: {resultado.nivel_riesgo_manual}
          </p>
          {resultado.observaciones && (
            <p className="mt-1 text-amber-700 dark:text-amber-400">{resultado.observaciones}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
        <div className="space-y-1">
          <label
            htmlFor="nivel-riesgo-manual"
            className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase"
          >
            Nuevo nivel de riesgo
          </label>
          <NivelRiesgoSelect id="nivel-riesgo-manual" required value={nivelId} onChange={setNivelId} />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="observaciones-riesgo"
            className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase"
          >
            Observaciones
          </label>
          <textarea
            id="observaciones-riesgo"
            rows={1}
            maxLength={500}
            required
            value={observaciones}
            onChange={(evento) => setObservaciones(evento.target.value)}
            placeholder="Motivo del cambio… (obligatorio)"
            className="border-input bg-card text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 min-h-9 w-full resize-y rounded-md border px-3 py-1.5 text-sm outline-none focus-visible:ring-[3px]"
          />
        </div>

        <Button
          type="submit"
          disabled={nivelId === "" || observacionesLimpias === "" || modificar.isPending}
        >
          {modificar.isPending ? "Guardando…" : "Modificar"}
        </Button>
      </form>
    </div>
  );
}
