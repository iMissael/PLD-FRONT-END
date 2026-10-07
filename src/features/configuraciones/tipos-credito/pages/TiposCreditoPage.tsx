import { useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { TipoCreditoForm } from "../components/TipoCreditoForm";
import { TiposCreditoTable } from "../components/TiposCreditoTable";
import { useTiposCredito } from "../hooks/useTiposCredito";
import {
  useActualizarTipoCredito,
  useCrearTipoCredito,
  useEliminarTipoCredito,
} from "../hooks/useTiposCreditoMutations";
import type { TipoCreditoResponse } from "../types/tipoCredito";

export function TiposCreditoPage() {
  const { data: tipos, isLoading } = useTiposCredito();

  const [seleccionado, setSeleccionado] = useState<TipoCreditoResponse | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearTipoCredito();
  const actualizar = useActualizarTipoCredito();
  const eliminar = useEliminarTipoCredito();

  const tipoEnEdicion = creandoNuevo ? null : seleccionado;
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
          toast.success("Tipo de crédito creado correctamente");
        },
        onError,
      });
    } else if (seleccionado) {
      actualizar.mutate(
        { id: seleccionado.id, input },
        {
          onSuccess: (tipoActualizado) => {
            setSeleccionado(tipoActualizado);
            toast.success("Tipo de crédito actualizado correctamente");
          },
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionado) return;
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja el tipo de crédito "${seleccionado.nombre}"?`)) {
      return;
    }
    setMensajeError(null);
    eliminar.mutate(seleccionado.id, {
      onSuccess: () => {
        setSeleccionado(null);
        toast.success("Tipo de crédito dado de baja correctamente");
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
          <h2 className="text-xl font-semibold text-fg">Tipos de crédito</h2>
          <p className="text-sm text-muted">
            Productos de crédito, el tipo de préstamo que los respalda y su nivel de
            riesgo PLD.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNuevo(true);
            setSeleccionado(null);
            setMensajeError(null);
          }}
        >
          Nuevo tipo
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <TiposCreditoTable
        tipos={tipos}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.id ?? null}
        onSeleccionar={(tipo) => {
          setSeleccionado(tipo);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
        onDoubleClick={(tipo) => {
          setSeleccionado(tipo);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
      />

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <TipoCreditoForm
            tipo={tipoEnEdicion}
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
