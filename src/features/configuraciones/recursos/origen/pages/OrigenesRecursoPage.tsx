import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { OrigenRecursoForm } from "../components/OrigenRecursoForm";
import { OrigenesRecursoTable } from "../components/OrigenesRecursoTable";
import { useOrigenesRecurso } from "../hooks/useOrigenesRecurso";
import {
  useActualizarOrigenRecurso,
  useCrearOrigenRecurso,
  useEliminarOrigenRecurso,
} from "../hooks/useOrigenesRecursoMutations";
import type { OrigenRecursoResponse } from "../types/origenRecurso";

export function OrigenesRecursoPage() {
  const { data: origenes, isLoading } = useOrigenesRecurso();

  const [seleccionado, setSeleccionado] = useState<OrigenRecursoResponse | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearOrigenRecurso();
  const actualizar = useActualizarOrigenRecurso();
  const eliminar = useEliminarOrigenRecurso();

  const origenEnEdicion = creandoNuevo ? null : seleccionado;
  const mostrarFormulario = creandoNuevo || seleccionado !== null;

  const handleGuardar = (input: Parameters<typeof crear.mutate>[0]) => {
    setMensajeError(null);
    const onError = (error: unknown) => {
      setMensajeError(isAppError(error) ? error.message : "Ocurrió un error inesperado.");
    };

    if (creandoNuevo) {
      crear.mutate(input, {
        onSuccess: () => setCreandoNuevo(false),
        onError,
      });
    } else if (seleccionado) {
      actualizar.mutate(
        { id: seleccionado.id, input },
        {
          onSuccess: (origenActualizado) => setSeleccionado(origenActualizado),
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionado) return;
    setMensajeError(null);
    eliminar.mutate(seleccionado.id, {
      onSuccess: () => setSeleccionado(null),
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
          <h2 className="text-xl font-semibold text-fg">Origen de recursos</h2>
          <p className="text-sm text-muted">
            Procedencia de los recursos del socio y el nivel de riesgo PLD asociado.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNuevo(true);
            setSeleccionado(null);
            setMensajeError(null);
          }}
        >
          Nuevo origen
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <OrigenesRecursoTable
        origenes={origenes}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.id ?? null}
        onSeleccionar={(origen) => {
          setSeleccionado(origen);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
        onDoubleClick={(origen) => {
          setSeleccionado(origen);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
      />

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <OrigenRecursoForm
            origen={origenEnEdicion}
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
