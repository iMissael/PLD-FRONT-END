import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { TiempoConstitucionForm } from "../components/TiempoConstitucionForm";
import { TiemposConstitucionTable } from "../components/TiemposConstitucionTable";
import { useTiemposConstitucion } from "../hooks/useTiemposConstitucion";
import {
  useActualizarTiempoConstitucion,
  useCrearTiempoConstitucion,
  useEliminarTiempoConstitucion,
} from "../hooks/useTiemposConstitucionMutations";
import type { TiempoConstitucionResponse } from "../types/tiempoConstitucion";

export function TiemposConstitucionPage() {
  const { data: tiempos, isLoading } = useTiemposConstitucion();

  const [seleccionado, setSeleccionado] = useState<TiempoConstitucionResponse | null>(
    null,
  );
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearTiempoConstitucion();
  const actualizar = useActualizarTiempoConstitucion();
  const eliminar = useEliminarTiempoConstitucion();

  const tiempoEnEdicion = creandoNuevo ? null : seleccionado;
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
          onSuccess: (tiempoActualizado) => setSeleccionado(tiempoActualizado),
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
          <h2 className="text-xl font-semibold text-foreground">
            Tiempo de constitución
          </h2>
          <p className="text-sm text-muted-foreground">
            Rangos de antigüedad de la empresa y el nivel de riesgo PLD asociado. El
            nombre se genera a partir del rango.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNuevo(true);
            setSeleccionado(null);
            setMensajeError(null);
          }}
        >
          Nuevo rango
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <TiemposConstitucionTable
        tiempos={tiempos}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.id ?? null}
        onSeleccionar={(tiempo) => {
          setSeleccionado(tiempo);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
      />

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <TiempoConstitucionForm
            tiempo={tiempoEnEdicion}
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
