import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";

import { CambiarRiesgoPepForm } from "../components/CambiarRiesgoPepForm";
import { PepsTable } from "../components/PepsTable";
import { usePeps } from "../hooks/usePeps";
import { useCambiarNivelRiesgoPep } from "../hooks/usePepsMutations";
import type { PepResponse } from "../types/pep";

/**
 * Pantalla de PEPs: consulta + cambio de nivel de riesgo.
 *
 * Sin alta ni baja a propósito: el catálogo es cerrado ("Es Persona
 * Políticamente Expuesta" / "No es Persona Políticamente Expuesta") y
 * `EvaluadorSubfactor` lo lee para puntuar la matriz de riesgo, así que
 * agregar o borrar una categoría rompería el scoring.
 */
export function PepsPage() {
  const { data: peps, isLoading } = usePeps();

  const [seleccionado, setSeleccionado] = useState<PepResponse | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const cambiarRiesgo = useCambiarNivelRiesgoPep();

  const handleGuardar = (catNivelRiesgoId: number) => {
    if (!seleccionado) return;
    setMensajeError(null);
    cambiarRiesgo.mutate(
      { id: seleccionado.id, input: { catNivelRiesgoId } },
      {
        onSuccess: (pepActualizado) => setSeleccionado(pepActualizado),
        onError: (error) => {
          setMensajeError(isAppError(error) ? error.message : "Ocurrió un error inesperado.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Personas políticamente expuestas (PEP)
        </h2>
        <p className="text-sm text-muted-foreground">
          Ajusta el nivel de riesgo PLD asociado a cada caso. El catálogo es fijo: no se dan
          de alta ni de baja registros desde esta vista.
        </p>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <PepsTable
        peps={peps}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.id ?? null}
        onSeleccionar={(pep) => {
          setSeleccionado(pep);
          setMensajeError(null);
        }}
        onDoubleClick={(pep) => {
          setSeleccionado(pep);
          setMensajeError(null);
        }}
      />

      {seleccionado ? (
        <div className="scroll-mt-4">
          <CambiarRiesgoPepForm
            pep={seleccionado}
            onGuardar={handleGuardar}
            onCancelar={() => setSeleccionado(null)}
            isPending={cambiarRiesgo.isPending}
          />
        </div>
      ) : null}
    </div>
  );
}
