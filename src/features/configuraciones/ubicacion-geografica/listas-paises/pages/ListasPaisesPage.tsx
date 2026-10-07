import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { ListaPaisAsignaciones } from "../components/ListaPaisAsignaciones";
import { ListaPaisDetalle } from "../components/ListaPaisDetalle";
import { ListaPaisForm } from "../components/ListaPaisForm";
import { ListasPaisesTable } from "../components/ListasPaisesTable";
import { useListasPaises } from "../hooks/useListasPaises";
import {
  useActualizarListaPais,
  useCrearListaPais,
  useEliminarListaPais,
} from "../hooks/useListasPaisesMutations";
import type { ListaPaisResponse } from "../types/listaPais";

export function ListasPaisesPage() {
  const { data: listas, isLoading } = useListasPaises();

  const [seleccionada, setSeleccionada] = useState<ListaPaisResponse | null>(null);
  const [verLista, setVerLista] = useState<ListaPaisResponse | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  /** Un clic solo selecciona y muestra el detalle; editar es un paso aparte. */
  const [editando, setEditando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const verListaRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (verLista) {
      verListaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [verLista]);

  const crear = useCrearListaPais();
  const actualizar = useActualizarListaPais();
  const eliminar = useEliminarListaPais();

  const listaEnEdicion = creandoNueva ? null : seleccionada;
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
          toast.success("Lista de países creada correctamente");
        },
        onError,
      });
    } else if (seleccionada) {
      actualizar.mutate(
        { id: seleccionada.id, input },
        {
          onSuccess: (listaActualizada) => {
            setSeleccionada(listaActualizada);
            toast.success("Lista de países actualizada correctamente");
          },
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionada) return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la lista "${seleccionada.nombre}"?`)) {
      return;
    }
    setMensajeError(null);
    eliminar.mutate(seleccionada.id, {
      onSuccess: () => {
        setSeleccionada(null);
        toast.success("Lista de países eliminada correctamente");
      },
      onError: (error) => {
        const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
        setMensajeError(msg);
        toast.error(msg);
      },
    });
  };

  const formRef = useRef<HTMLDivElement | null>(null);

  const handleVerLista = (lista: ListaPaisResponse) => {
    setVerLista(lista);
    setSeleccionada(lista);
    setTimeout(() => {
      verListaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Listas de países</h2>
          <p className="text-sm text-muted-foreground">
            Administra las listas de países de riesgo PLD y los países asignados a cada una.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
            setEditando(false);
            setVerLista(null);
            setMensajeError(null);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 50);
          }}
        >
          Nueva lista
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <ListasPaisesTable
        listas={listas}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        verId={verLista?.id ?? null}
        onSeleccionar={(lista) => {
          setSeleccionada(lista);
          setCreandoNueva(false);
          setEditando(false);
          setMensajeError(null);
        }}
        onDoubleClick={handleVerLista}
        onVer={(lista) => setVerLista((prev) => (prev?.id === lista.id ? null : lista))}
      />

      {verLista ? (
        <div ref={verListaRef} className="scroll-mt-4">
          <ListaPaisAsignaciones lista={verLista} onCerrar={() => setVerLista(null)} />
        </div>
      ) : null}

      {mostrarDetalle && seleccionada ? (
        <ListaPaisDetalle
          lista={seleccionada}
          onEditar={() => {
            setEditando(true);
            setMensajeError(null);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 50);
          }}
        />
      ) : null}

      {mostrarFormulario ? (
        <div ref={formRef} className="flex flex-col gap-3 scroll-mt-4">
          <ListaPaisForm
            lista={listaEnEdicion}
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
              {eliminar.isPending ? "Eliminando..." : "Eliminar lista"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
