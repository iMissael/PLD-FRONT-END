import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";

import { CambiarRiesgoHistorialForm } from "../components/CambiarRiesgoHistorialForm";
import { HistorialesCrediticiosTable } from "../components/HistorialesCrediticiosTable";
import { useHistorialesCrediticios } from "../hooks/useHistorialesCrediticios";
import { useCambiarNivelRiesgoHistorial } from "../hooks/useHistorialesCrediticiosMutations";
import type { HistorialCrediticioResponse } from "../types/historialCrediticio";

/**
 * Pantalla de Historial crediticio: consulta + cambio de nivel de riesgo.
 *
 * Sin alta ni baja a propósito: el catálogo es cerrado ("con historial" /
 * "sin historial") y `ConsultaAdapter` lo lee para puntuar la matriz de
 * riesgo, así que borrar un caso rompería el scoring.
 */
export function HistorialesCrediticiosPage() {
  const { data: historiales, isLoading } = useHistorialesCrediticios();

  const [seleccionado, setSeleccionado] = useState<HistorialCrediticioResponse | null>(
    null,
  );
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const cambiarRiesgo = useCambiarNivelRiesgoHistorial();

  const handleGuardar = (catNivelRiesgoId: number) => {
    if (!seleccionado) return;
    setMensajeError(null);
    cambiarRiesgo.mutate(
      { id: seleccionado.id, input: { catNivelRiesgoId } },
      {
        onSuccess: (historialActualizado) => setSeleccionado(historialActualizado),
        onError: (error) => {
          setMensajeError(
            isAppError(error) ? error.message : "Ocurrió un error inesperado.",
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-fg">Historial crediticio</h2>
        <p className="text-sm text-muted">
          Ajusta el nivel de riesgo PLD asociado a cada caso. El catálogo es fijo: no se
          dan de alta ni de baja registros desde esta vista.
        </p>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <HistorialesCrediticiosTable
        historiales={historiales}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.id ?? null}
        onSeleccionar={(historial) => {
          setSeleccionado(historial);
          setMensajeError(null);
        }}
      />

      {seleccionado ? (
        <CambiarRiesgoHistorialForm
          historial={seleccionado}
          onGuardar={handleGuardar}
          onCancelar={() => setSeleccionado(null)}
          isPending={cambiarRiesgo.isPending}
        />
      ) : null}
    </div>
  );
}
