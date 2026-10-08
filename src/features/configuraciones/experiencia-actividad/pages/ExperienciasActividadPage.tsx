import { useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { ExperienciaActividadDetalle } from "../components/ExperienciaActividadDetalle";
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
  /** Un clic solo selecciona y muestra el detalle; editar es un paso aparte. */
  const [editando, setEditando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearExperienciaActividad();
  const actualizar = useActualizarExperienciaActividad();
  const eliminar = useEliminarExperienciaActividad();

  const experienciaEnEdicion = creandoNueva ? null : seleccionada;
  const mostrarFormulario = creandoNueva || (seleccionada !== null && editando);
  const mostrarDetalle = !creandoNueva && seleccionada !== null && !editando;

  const handleGuardar = (input: Parameters<typeof crear.mutate>[0]) => {
    setMensajeError(null);
    const onError = (error: unknown) => {
      const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
      setMensajeError(msg);
      toast.error(msg);
    };

    if (creandoNueva) {
      crear.mutate(input, {
        onSuccess: () => {
          setCreandoNueva(false);
          toast.success("Rango de experiencia creado correctamente");
        },
        onError,
      });
    } else if (seleccionada) {
      actualizar.mutate(
        { id: seleccionada.id, input },
        {
          onSuccess: (experienciaActualizada) => {
            setSeleccionada(experienciaActualizada);
            toast.success("Rango de experiencia actualizado correctamente");
          },
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionada) return;
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja el rango "${seleccionada.nombre}"?`)) {
      return;
    }
    setMensajeError(null);
    eliminar.mutate(seleccionada.id, {
      onSuccess: () => {
        setSeleccionada(null);
        toast.success("Rango de experiencia dado de baja correctamente");
      },
      onError: (error) => {
        const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
        setMensajeError(msg);
        toast.error(msg);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Experiencia de actividad
          </h2>
          <p className="text-sm text-muted-foreground">
            Rangos de años de experiencia en la actividad y el nivel de riesgo PLD
            asociado. El nombre se genera a partir del rango.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
            setEditando(false);
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
          setEditando(false);
          setMensajeError(null);
        }}
        onDoubleClick={(experiencia) => {
          setSeleccionada(experiencia);
          setCreandoNueva(false);
          setEditando(true);
          setMensajeError(null);
        }}
      />

      {mostrarDetalle && seleccionada ? (
        <ExperienciaActividadDetalle
          experiencia={seleccionada}
          onEditar={() => {
            setEditando(true);
            setMensajeError(null);
          }}
        />
      ) : null}

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <ExperienciaActividadForm
            experiencia={experienciaEnEdicion}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setCreandoNueva(false);
              setEditando(false);
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
