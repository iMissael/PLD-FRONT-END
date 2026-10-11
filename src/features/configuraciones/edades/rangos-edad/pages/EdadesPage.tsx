import { useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { EdadDetalle } from "../components/EdadDetalle";
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
  /** Un clic solo selecciona y muestra el detalle; editar es un paso aparte. */
  const [editando, setEditando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearEdad();
  const actualizar = useActualizarEdad();
  const eliminar = useEliminarEdad();

  const edadEnEdicion = creandoNueva ? null : seleccionada;
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
          toast.success("Rango de edad creado correctamente");
        },
        onError,
      });
    } else if (seleccionada) {
      actualizar.mutate(
        { id: seleccionada.id, input },
        {
          onSuccess: (edadActualizada) => {
            setSeleccionada(edadActualizada);
            toast.success("Rango de edad actualizado correctamente");
          },
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionada) return;
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja el rango de edad "${seleccionada.edadInicial} - ${seleccionada.edadFinal} años"?`)) {
      return;
    }
    setMensajeError(null);
    eliminar.mutate(seleccionada.id, {
      onSuccess: () => {
        setSeleccionada(null);
        toast.success("Rango de edad dado de baja correctamente");
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
          <h2 className="text-xl font-semibold text-foreground">Edades</h2>
          <p className="text-sm text-muted-foreground">
            Rangos de edad y el nivel de riesgo PLD asociado a cada uno.
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

      <EdadesTable
        edades={edades}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        onSeleccionar={(edad) => {
          setSeleccionada(edad);
          setCreandoNueva(false);
          setEditando(false);
          setMensajeError(null);
        }}
        onDoubleClick={(edad) => {
          setSeleccionada(edad);
          setCreandoNueva(false);
          setEditando(true);
          setMensajeError(null);
        }}
      />

      {mostrarDetalle && seleccionada ? (
        <EdadDetalle
          edad={seleccionada}
          onEditar={() => {
            setEditando(true);
            setMensajeError(null);
          }}
        />
      ) : null}

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <EdadForm
            edad={edadEnEdicion}
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
