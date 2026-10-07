<<<<<<< HEAD
import { useRef, useState } from "react";
=======
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
>>>>>>> origin/develop

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

<<<<<<< HEAD
import { ListaForm } from "../components/ListaForm";
import { ListaPaises } from "../components/ListaPaises";
import { ListasTable } from "../components/ListasTable";
import {
  useActualizarLista,
  useCrearLista,
  useEliminarLista,
  useListasPaises,
} from "../hooks/useListasPaises";
import type { ListaPaisInput, ListaPaisResponse } from "../types/listaPais";

/** Listas de riesgo de países: cooperantes, no cooperantes (GAFI), paraísos fiscales... */
export function ListasPaisesPage() {
  const { data: listas, isLoading } = useListasPaises();
=======
import { ListaPaisAsignaciones } from "../components/ListaPaisAsignaciones";
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

>>>>>>> origin/develop
  const [seleccionada, setSeleccionada] = useState<ListaPaisResponse | null>(null);
  const [verLista, setVerLista] = useState<ListaPaisResponse | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
<<<<<<< HEAD
  const formRef = useRef<HTMLDivElement | null>(null);

  const crear = useCrearLista();
  const actualizar = useActualizarLista();
  const eliminar = useEliminarLista();

  const onError = (error: unknown) =>
    setMensajeError(isAppError(error) ? error.message : "Ocurrió un error inesperado.");

  const handleGuardar = (input: ListaPaisInput) => {
    setMensajeError(null);
    if (creandoNueva) {
      crear.mutate(input, { onSuccess: () => setCreandoNueva(false), onError });
    } else if (seleccionada) {
      actualizar.mutate(
        { id: seleccionada.id, input },
        { onSuccess: (lista) => setSeleccionada(lista), onError },
=======

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
  const mostrarFormulario = creandoNueva || seleccionada !== null;

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
>>>>>>> origin/develop
      );
    }
  };

<<<<<<< HEAD
  const mostrarFormulario = creandoNueva || seleccionada !== null;
=======
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
>>>>>>> origin/develop

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Listas de países</h2>
          <p className="text-sm text-muted-foreground">
<<<<<<< HEAD
            Listas de riesgo PLD de países. Un país puede estar en varias; la matriz toma la de nivel más
            alto. Los países se asignan desde la pantalla de Países.
=======
            Administra las listas de países de riesgo PLD y los países asignados a cada una.
>>>>>>> origin/develop
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
<<<<<<< HEAD
            setMensajeError(null);
            setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
=======
            setVerLista(null);
            setMensajeError(null);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 50);
>>>>>>> origin/develop
          }}
        >
          Nueva lista
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

<<<<<<< HEAD
      <ListasTable
=======
      <ListasPaisesTable
>>>>>>> origin/develop
        listas={listas}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        verId={verLista?.id ?? null}
        onSeleccionar={(lista) => {
          setSeleccionada(lista);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
<<<<<<< HEAD
        onVer={(lista) => setVerLista((prev) => (prev?.id === lista.id ? null : lista))}
      />

      {verLista ? <ListaPaises lista={verLista} onCerrar={() => setVerLista(null)} /> : null}

      {mostrarFormulario ? (
        <div ref={formRef} className="flex flex-col gap-3 scroll-mt-4">
          <ListaForm
            lista={creandoNueva ? null : seleccionada}
=======
        onDoubleClick={handleVerLista}
        onVer={(lista) => setVerLista((prev) => (prev?.id === lista.id ? null : lista))}
      />

      {verLista ? (
        <div ref={verListaRef} className="scroll-mt-4">
          <ListaPaisAsignaciones lista={verLista} onCerrar={() => setVerLista(null)} />
        </div>
      ) : null}

      {mostrarFormulario ? (
        <div ref={formRef} className="flex flex-col gap-3 scroll-mt-4">
          <ListaPaisForm
            lista={listaEnEdicion}
>>>>>>> origin/develop
            onGuardar={handleGuardar}
            onCancelar={() => {
              setCreandoNueva(false);
              setSeleccionada(null);
              setMensajeError(null);
            }}
            isPending={crear.isPending || actualizar.isPending}
          />
<<<<<<< HEAD
          {seleccionada && !creandoNueva ? (
            <Button
              variante="peligro"
              className="self-start"
              disabled={eliminar.isPending}
              onClick={() => {
                setMensajeError(null);
                eliminar.mutate(seleccionada.id, { onSuccess: () => setSeleccionada(null), onError });
              }}
=======
          {seleccionada ? (
            <Button
              variante="peligro"
              className="self-start"
              onClick={handleEliminar}
              disabled={eliminar.isPending}
>>>>>>> origin/develop
            >
              {eliminar.isPending ? "Eliminando..." : "Eliminar lista"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
