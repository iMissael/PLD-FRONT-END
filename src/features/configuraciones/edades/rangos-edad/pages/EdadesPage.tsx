import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { EdadForm } from "../components/EdadForm";
import { EdadesTable } from "../components/EdadesTable";
import { useEdades } from "../hooks/useEdades";
import {
  useActualizarEdad,
  useCrearEdad,
  useEliminarEdad,
} from "../hooks/useEdadesMutations";
import type { EdadResponse } from "../types/edad";

export function EdadesPage() {
  const { data: edades, isLoading } = useEdades();

  const [seleccionada, setSeleccionada] = useState<EdadResponse | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearEdad();
  const actualizar = useActualizarEdad();
  const eliminar = useEliminarEdad();

  const edadEnEdicion = creandoNueva ? null : seleccionada;
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
          onSuccess: (edadActualizada) => setSeleccionada(edadActualizada),
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
          <h2 className="text-xl font-semibold text-foreground">Edades</h2>
          <p className="text-sm text-muted-foreground">
            Rangos de edad y el nivel de riesgo PLD asociado a cada uno.
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

      <EdadesTable
        edades={edades}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        onSeleccionar={(edad) => {
          setSeleccionada(edad);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
        onDoubleClick={(edad) => {
          setSeleccionada(edad);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
      />

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <EdadForm
            edad={edadEnEdicion}
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
