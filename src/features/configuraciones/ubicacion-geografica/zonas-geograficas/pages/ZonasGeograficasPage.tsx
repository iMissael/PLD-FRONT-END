import { useEffect, useRef, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { ZonaAsignaciones } from "../components/ZonaAsignaciones";
import { ZonaForm } from "../components/ZonaForm";
import { ZonasTable } from "../components/ZonasTable";
import { useZonasGeograficas } from "../hooks/useZonasGeograficas";
import {
  useCrearZona,
  useEliminarZona,
  useActualizarZona,
} from "../hooks/useZonasGeograficasMutations";
import type { EntidadPais, ZonaGeograficaResponse } from "../types/zonaGeografica";

interface ZonasGeograficasPageProps {
  tipo?: EntidadPais;
}

export function ZonasGeograficasPage({ tipo }: ZonasGeograficasPageProps) {
  const { data: zonas, isLoading } = useZonasGeograficas();

  const [seleccionada, setSeleccionada] = useState<ZonaGeograficaResponse | null>(null);
  const [verZona, setVerZona] = useState<ZonaGeograficaResponse | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Al abrir "Ver" debe verse de inmediato, sin tener que bajar la página
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

  const formRef = useRef<HTMLDivElement | null>(null);

  const handleVerZona = (zona: ZonaGeograficaResponse) => {
    setVerZona(zona);
    setSeleccionada(zona);
    setTimeout(() => {
      verZonaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const subtitulo =
    tipo === "P"
      ? "Administra las zonas de riesgo PLD y los países asignados a cada una."
      : tipo === "E"
      ? "Administra las zonas de riesgo PLD y las entidades asignadas a cada una."
      : "Administra las zonas de riesgo PLD y las entidades/países asignados a cada una.";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Zonas geográficas</h2>
          <p className="text-sm text-muted-foreground">{subtitulo}</p>
        </div>
        <Button
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
            setVerZona(null);
            setMensajeError(null);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 50);
          }}
        >
          Nueva zona
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <ZonasTable
        zonas={zonas}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        verId={verZona?.id ?? null}
        tipoFiltro={tipo}
        onSeleccionar={(zona) => {
          setSeleccionada(zona);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
        onDoubleClick={handleVerZona}
        onVer={(zona) => setVerZona((prev) => (prev?.id === zona.id ? null : zona))}
      />

      {verZona ? (
        <div ref={verZonaRef} className="scroll-mt-4">
          <ZonaAsignaciones zona={verZona} onCerrar={() => setVerZona(null)} />
        </div>
      ) : null}

      {mostrarFormulario ? (
        <div ref={formRef} className="flex flex-col gap-3 scroll-mt-4">
          <ZonaForm
            zona={zonaEnEdicion}
            defaultTipo={tipo ?? "P"}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setCreandoNueva(false);
              setSeleccionada(null);
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
              {eliminar.isPending ? "Eliminando..." : "Eliminar zona"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
