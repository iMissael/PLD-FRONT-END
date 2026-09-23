import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";

import { EntidadForm } from "../components/EntidadForm";
import { EntidadesTable } from "../components/EntidadesTable";
import { useEntidades } from "../hooks/useEntidades";
import {
  useActualizarEntidad,
  useCrearEntidad,
  useEliminarEntidad,
} from "../hooks/useEntidadesMutations";
import type { CrearEntidadInput, EntidadResponse } from "../types/entidad";

export function EntidadesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const { data: entidades, isLoading } = useEntidades(
    busquedaAplicada ? { busqueda: busquedaAplicada } : undefined,
  );

  const [seleccionada, setSeleccionada] = useState<EntidadResponse | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearEntidad();
  const actualizar = useActualizarEntidad();
  const eliminar = useEliminarEntidad();

  const entidadEnEdicion = creandoNueva ? null : seleccionada;
  const mostrarFormulario = creandoNueva || seleccionada !== null;

  const handleGuardar = (input: CrearEntidadInput) => {
    setMensajeError(null);
    const onError = (error: unknown) => {
      setMensajeError(isAppError(error) ? error.message : "Ocurrió un error inesperado.");
    };

    if (creandoNueva) {
      crear.mutate(input, { onSuccess: () => setCreandoNueva(false), onError });
    } else if (seleccionada) {
      actualizar.mutate(
        { id: seleccionada.idEntidad, input },
        {
          onSuccess: (entidadActualizada) => setSeleccionada(entidadActualizada),
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionada) return;
    setMensajeError(null);
    eliminar.mutate(seleccionada.idEntidad, {
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
          <h2 className="text-xl font-semibold text-slate-900">Entidades</h2>
          <p className="text-sm text-slate-500">
            Administra las entidades federativas y su zona de riesgo asignada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
            setMensajeError(null);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Nueva entidad
        </button>
      </div>

      {mensajeError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {mensajeError}
        </p>
      ) : null}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre de entidad..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") setBusquedaAplicada(busqueda.trim());
          }}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setBusquedaAplicada(busqueda.trim())}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Buscar
        </button>
      </div>

      <EntidadesTable
        entidades={entidades}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.idEntidad ?? null}
        onSeleccionar={(entidad) => {
          setSeleccionada(entidad);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
      />

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <EntidadForm
            entidad={entidadEnEdicion}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setCreandoNueva(false);
              setSeleccionada(null);
              setMensajeError(null);
            }}
            isPending={crear.isPending || actualizar.isPending}
          />
          {seleccionada ? (
            <button
              type="button"
              onClick={handleEliminar}
              disabled={eliminar.isPending}
              className="self-start rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {eliminar.isPending ? "Eliminando..." : "Eliminar entidad"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
