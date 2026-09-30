import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { PrestamoMontoForm } from "../components/PrestamoMontoForm";
import { PrestamosMontoTable } from "../components/PrestamosMontoTable";
import { usePrestamosMonto } from "../hooks/usePrestamosMonto";
import {
  useActualizarPrestamoMonto,
  useCrearPrestamoMonto,
  useEliminarPrestamoMonto,
} from "../hooks/usePrestamosMontoMutations";
import type { PrestamoMontoResponse } from "../types/prestamoMonto";

export function PrestamosMontoPage() {
  const { data: rangos, isLoading } = usePrestamosMonto();

  const [seleccionado, setSeleccionado] = useState<PrestamoMontoResponse | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearPrestamoMonto();
  const actualizar = useActualizarPrestamoMonto();
  const eliminar = useEliminarPrestamoMonto();

  const rangoEnEdicion = creandoNuevo ? null : seleccionado;
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
          onSuccess: (rangoActualizado) => setSeleccionado(rangoActualizado),
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
          <h2 className="text-xl font-semibold text-fg">Monto de crédito</h2>
          <p className="text-sm text-muted">
            Rangos de monto solicitado y el nivel de riesgo PLD asociado. El nombre se
            genera a partir del rango.
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

      <PrestamosMontoTable
        rangos={rangos}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.id ?? null}
        onSeleccionar={(rango) => {
          setSeleccionado(rango);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
        onDoubleClick={(rango) => {
          setSeleccionado(rango);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
      />

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3 scroll-mt-4">
          <PrestamoMontoForm
            rango={rangoEnEdicion}
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
