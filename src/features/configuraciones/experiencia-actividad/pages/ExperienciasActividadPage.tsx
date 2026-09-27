import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/Button";

import { ExperienciaActividadForm } from "../components/ExperienciaActividadForm";
import { ExperienciasActividadTable } from "../components/ExperienciasActividadTable";
import { useExperienciasActividad } from "../hooks/useExperienciasActividad";
import {
  useActualizarExperienciaActividad,
  useCrearExperienciaActividad,
  useEliminarExperienciaActividad,
} from "../hooks/useExperienciasActividadMutations";
import type { ExperienciaActividadResponse } from "../types/experienciaActividad";

export function ExperienciasActividadPage() {
  const { data: experiencias, isLoading } = useExperienciasActividad();

  const [seleccionada, setSeleccionada] = useState<ExperienciaActividadResponse | null>(
    null,
  );
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearExperienciaActividad();
  const actualizar = useActualizarExperienciaActividad();
  const eliminar = useEliminarExperienciaActividad();

  const experienciaEnEdicion = creandoNueva ? null : seleccionada;
  const mostrarFormulario = creandoNueva || seleccionada !== null;

  const handleGuardar = (input: Parameters<typeof crear.mutate>[0]) => {
    setMensajeError(null);
    const onError = (error: unknown) => {
      setMensajeError(isAppError(error) ? error.message : "Ocurrió un error inesperado.");
    };

    if (creandoNueva) {
      crear.mutate(input, {
        onSuccess: () => setCreandoNueva(false),
        onError,
      });
    } else if (seleccionada) {
      actualizar.mutate(
        { id: seleccionada.id, input },
        {
          onSuccess: (experienciaActualizada) => setSeleccionada(experienciaActualizada),
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionada) return;
    setMensajeError(null);
    eliminar.mutate(seleccionada.id, {
      onSuccess: () => setSeleccionada(null),
      onError: (error) => {
        setMensajeError(
          isAppError(error) ? error.message : "Ocurrió un error inesperado.",
        );
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-fg">Experiencia de actividad</h2>
          <p className="text-sm text-muted">
            Rangos de años de experiencia en la actividad y el nivel de riesgo PLD
            asociado. El nombre se genera a partir del rango.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
            setMensajeError(null);
          }}
        >
          Nuevo rango
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <ExperienciasActividadTable
        experiencias={experiencias}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        onSeleccionar={(experiencia) => {
          setSeleccionada(experiencia);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
      />

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <ExperienciaActividadForm
            experiencia={experienciaEnEdicion}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setCreandoNueva(false);
              setSeleccionada(null);
              setMensajeError(null);
            }}
            isPending={crear.isPending || actualizar.isPending}
          />
          {seleccionada ? (
            <Button
              variante="peligro"
              className="self-start"
              onClick={handleEliminar}
              disabled={eliminar.isPending}
            >
              {eliminar.isPending ? "Dando de baja..." : "Dar de baja"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
