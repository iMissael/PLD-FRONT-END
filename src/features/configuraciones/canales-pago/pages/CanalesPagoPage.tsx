import { useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { CanalesPagoTable } from "../components/CanalesPagoTable";
import { CanalPagoForm } from "../components/CanalPagoForm";
import { useCanalesPago } from "../hooks/useCanalesPago";
import {
  useActualizarCanalPago,
  useCrearCanalPago,
  useEliminarCanalPago,
} from "../hooks/useCanalesPagoMutations";
import type { CanalPagoResponse } from "../types/canalPago";

export function CanalesPagoPage() {
  const { data: canales, isLoading } = useCanalesPago();

  const [seleccionado, setSeleccionado] = useState<CanalPagoResponse | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearCanalPago();
  const actualizar = useActualizarCanalPago();
  const eliminar = useEliminarCanalPago();

  const canalEnEdicion = creandoNuevo ? null : seleccionado;
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
          toast.success("Canal de pago creado correctamente");
        },
        onError,
      });
    } else if (seleccionado) {
      actualizar.mutate(
        { id: seleccionado.id, input },
        {
          onSuccess: (canalActualizado) => {
            setSeleccionado(canalActualizado);
            toast.success("Canal de pago actualizado correctamente");
          },
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionadaOpcion(seleccionado)) return;
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja el canal "${seleccionado?.nombre}"?`)) {
      return;
    }
    setMensajeError(null);
    eliminar.mutate(seleccionado!.id, {
      onSuccess: () => {
        setSeleccionado(null);
        toast.success("Canal de pago dado de baja correctamente");
      },
      onError: (error) => {
        const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
        setMensajeError(msg);
        toast.error(msg);
      },
    });
  };

  function seleccionadaOpcion(item: CanalPagoResponse | null): item is CanalPagoResponse {
    return item !== null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-fg">Canales de pago</h2>
          <p className="text-sm text-muted">
            Medios por los que el socio realiza sus pagos y el nivel de riesgo PLD
            asociado.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNuevo(true);
            setSeleccionado(null);
            setMensajeError(null);
          }}
        >
          Nuevo canal
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <CanalesPagoTable
        canales={canales}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.id ?? null}
        onSeleccionar={(canal) => {
          setSeleccionado(canal);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
        onDoubleClick={(canal) => {
          setSeleccionado(canal);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
      />

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <CanalPagoForm
            canal={canalEnEdicion}
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
