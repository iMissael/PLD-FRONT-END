import { useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { DestinoRecursoForm } from "../components/DestinoRecursoForm";
import { DestinosRecursoTable } from "../components/DestinosRecursoTable";
import { useDestinosRecurso } from "../hooks/useDestinosRecurso";
import {
  useActualizarDestinoRecurso,
  useCrearDestinoRecurso,
  useEliminarDestinoRecurso,
} from "../hooks/useDestinosRecursoMutations";
import type { DestinoRecursoResponse } from "../types/destinoRecurso";

export function DestinosRecursoPage() {
  const { data: destinos, isLoading } = useDestinosRecurso();

  const [seleccionado, setSeleccionado] = useState<DestinoRecursoResponse | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearDestinoRecurso();
  const actualizar = useActualizarDestinoRecurso();
  const eliminar = useEliminarDestinoRecurso();

  const destinoEnEdicion = creandoNuevo ? null : seleccionado;
  const mostrarFormulario = creandoNuevo || seleccionado !== null;

  const handleGuardar = (input: Parameters<typeof crear.mutate>[0]) => {
    setMensajeError(null);
    const onError = (error: unknown) => {
      const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
      setMensajeError(msg);
      toast.error(msg);
    };

    if (creandoNuevo) {
      crear.mutate(input, {
        onSuccess: () => {
          setCreandoNuevo(false);
          toast.success("Destino de recurso creado correctamente");
        },
        onError,
      });
    } else if (seleccionado) {
      actualizar.mutate(
        { id: seleccionado.id, input },
        {
          onSuccess: (destinoActualizado) => {
            setSeleccionado(destinoActualizado);
            toast.success("Destino de recurso actualizado correctamente");
          },
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionado) return;
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja el destino "${seleccionado.nombre}"?`)) {
      return;
    }
    setMensajeError(null);
    eliminar.mutate(seleccionado.id, {
      onSuccess: () => {
        setSeleccionado(null);
        toast.success("Destino de recurso dado de baja correctamente");
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
          <h2 className="text-xl font-semibold text-fg">Destino de recursos</h2>
          <p className="text-sm text-muted">
            Uso que el socio dará a los recursos y el nivel de riesgo PLD asociado.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNuevo(true);
            setSeleccionado(null);
            setMensajeError(null);
          }}
        >
          Nuevo destino
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <DestinosRecursoTable
        destinos={destinos}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.id ?? null}
        onSeleccionar={(destino) => {
          setSeleccionado(destino);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
        onDoubleClick={(destino) => {
          setSeleccionado(destino);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
      />

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <DestinoRecursoForm
            destino={destinoEnEdicion}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setCreandoNuevo(false);
              setSeleccionado(null);
              setMensajeError(null);
            }}
            isPending={crear.isPending || actualizar.isPending}
          />
          {seleccionado ? (
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
