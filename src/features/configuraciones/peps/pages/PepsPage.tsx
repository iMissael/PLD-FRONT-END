import { useRef, useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { PepDetalle } from "../components/PepDetalle";
import { PepForm } from "../components/PepForm";
import { PepsTable } from "../components/PepsTable";
import { usePeps } from "../hooks/usePeps";
import { useActualizarPep, useCrearPep, useEliminarPep } from "../hooks/usePepsMutations";
import type { CrearPepInput, PepResponse } from "../types/pep";

export function PepsPage() {
  const { data: peps, isLoading } = usePeps();

  const [seleccionado, setSeleccionado] = useState<PepResponse | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  /** Un clic solo selecciona y muestra el detalle; editar es un paso aparte. */
  const [editando, setEditando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const crear = useCrearPep();
  const actualizar = useActualizarPep();
  const eliminar = useEliminarPep();

  const pepEnEdicion = creandoNuevo ? null : seleccionado;
  const mostrarFormulario = creandoNuevo || (seleccionado !== null && editando);
  const mostrarDetalle = !creandoNuevo && seleccionado !== null && !editando;

  const handleGuardar = (input: CrearPepInput) => {
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
          toast.success("PEP creado correctamente");
        },
        onError,
      });
    } else if (seleccionado) {
      actualizar.mutate(
        { id: seleccionado.id, input },
        {
          onSuccess: (actualizado) => {
            setSeleccionado(actualizado);
            setEditando(false);
            toast.success("PEP actualizado correctamente");
          },
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionado) return;
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja el PEP "${seleccionado.nombre}"?`)) {
      return;
    }
    setMensajeError(null);
    eliminar.mutate(seleccionado.id, {
      onSuccess: () => {
        setSeleccionado(null);
        setEditando(false);
        toast.success("PEP dado de baja correctamente");
      },
      onError: (error) => {
        const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
        setMensajeError(msg);
        toast.error(msg);
      },
    });
  };

  const handleEditar = (pep: PepResponse) => {
    setSeleccionado(pep);
    setCreandoNuevo(false);
    setEditando(true);
    setMensajeError(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Configuración de PEPs</h2>
          <p className="text-sm text-muted-foreground">
            Condición de Persona Políticamente Expuesta y su ponderación de riesgo PLD.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNuevo(true);
            setSeleccionado(null);
            setEditando(false);
            setMensajeError(null);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 50);
          }}
        >
          Nuevo PEP
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <PepsTable
        peps={peps}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.id ?? null}
        onSeleccionar={(pep) => {
          setSeleccionado(pep);
          setCreandoNuevo(false);
          setEditando(false);
          setMensajeError(null);
        }}
        onDoubleClick={handleEditar}
      />

      {mostrarDetalle && seleccionado ? (
        <PepDetalle pep={seleccionado} onEditar={() => handleEditar(seleccionado)} />
      ) : null}

      {mostrarFormulario ? (
        <div ref={formRef} className="flex flex-col gap-3 scroll-mt-4">
          <PepForm
            pep={pepEnEdicion}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setCreandoNuevo(false);
              setEditando(false);
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
