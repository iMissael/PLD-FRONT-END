import { useEffect, useRef, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";

import { ZonaAsignaciones } from "../components/ZonaAsignaciones";
import { ZonaForm } from "../components/ZonaForm";
import { ZonasTable } from "../components/ZonasTable";
import { useZonasGeograficas } from "../hooks/useZonasGeograficas";
import {
  useCrearZona,
  useEliminarZona,
  useActualizarZona,
} from "../hooks/useZonasGeograficasMutations";
import type { ZonaGeograficaResponse } from "../types/zonaGeografica";

export function ZonasGeograficasPage() {
  const { data: zonas, isLoading } = useZonasGeograficas();

  const [seleccionada, setSeleccionada] = useState<ZonaGeograficaResponse | null>(null);
  const [verZona, setVerZona] = useState<ZonaGeograficaResponse | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Al abrir "Ver" debe verse de inmediato, sin tener que bajar la página
  // (antes quedaba abajo del formulario de edición, si ambos estaban abiertos).
  const verZonaRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (verZona) {
      verZonaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [verZona]);

  const crear = useCrearZona();
  const actualizar = useActualizarZona();
  const eliminar = useEliminarZona();

  const zonaEnEdicion = creandoNueva ? null : seleccionada;
  const mostrarFormulario = creandoNueva || seleccionada !== null;

  const handleGuardar = (input: Parameters<typeof crear.mutate>[0]) => {
    setMensajeError(null);
    const onError = (error: unknown) => {
      setMensajeError(isAppError(error) ? error.message : "Ocurrió un error inesperado.");
    };

    if (creandoNueva) {
      crear.mutate(input, {
        onSuccess: () => setCreandoNueva(false),
        onError,
      });
    } else if (seleccionada) {
      actualizar.mutate(
        { id: seleccionada.id, input },
        {
          onSuccess: (zonaActualizada) => setSeleccionada(zonaActualizada),
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionada) return;
    setMensajeError(null);
    eliminar.mutate(seleccionada.id, {
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
          <h2 className="text-xl font-semibold text-slate-900">Zonas geográficas</h2>
          <p className="text-sm text-slate-500">
            Administra las zonas de riesgo PLD y las entidades/países asignados a cada
            una.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
            setVerZona(null);
            setMensajeError(null);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Nueva zona
        </button>
      </div>

      {mensajeError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {mensajeError}
        </p>
      ) : null}

      <ZonasTable
        zonas={zonas}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        verId={verZona?.id ?? null}
        onSeleccionar={(zona) => {
          setSeleccionada(zona);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
        onVer={(zona) => setVerZona((prev) => (prev?.id === zona.id ? null : zona))}
      />

      {verZona ? (
        <div ref={verZonaRef}>
          <ZonaAsignaciones zona={verZona} onCerrar={() => setVerZona(null)} />
        </div>
      ) : null}

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <ZonaForm
            zona={zonaEnEdicion}
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
              {eliminar.isPending ? "Eliminando..." : "Eliminar zona"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
