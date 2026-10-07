import { useRef, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

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
  const [seleccionada, setSeleccionada] = useState<ListaPaisResponse | null>(null);
  const [verLista, setVerLista] = useState<ListaPaisResponse | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
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
      );
    }
  };

  const mostrarFormulario = creandoNueva || seleccionada !== null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Listas de países</h2>
          <p className="text-sm text-muted-foreground">
            Listas de riesgo PLD de países. Un país puede estar en varias; la matriz toma la de nivel más
            alto. Los países se asignan desde la pantalla de Países.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
            setMensajeError(null);
            setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
          }}
        >
          Nueva lista
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <ListasTable
        listas={listas}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        verId={verLista?.id ?? null}
        onSeleccionar={(lista) => {
          setSeleccionada(lista);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
        onVer={(lista) => setVerLista((prev) => (prev?.id === lista.id ? null : lista))}
      />

      {verLista ? <ListaPaises lista={verLista} onCerrar={() => setVerLista(null)} /> : null}

      {mostrarFormulario ? (
        <div ref={formRef} className="flex flex-col gap-3 scroll-mt-4">
          <ListaForm
            lista={creandoNueva ? null : seleccionada}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setCreandoNueva(false);
              setSeleccionada(null);
              setMensajeError(null);
            }}
            isPending={crear.isPending || actualizar.isPending}
          />
          {seleccionada && !creandoNueva ? (
            <Button
              variante="peligro"
              className="self-start"
              disabled={eliminar.isPending}
              onClick={() => {
                setMensajeError(null);
                eliminar.mutate(seleccionada.id, { onSuccess: () => setSeleccionada(null), onError });
              }}
            >
              {eliminar.isPending ? "Eliminando..." : "Eliminar lista"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
