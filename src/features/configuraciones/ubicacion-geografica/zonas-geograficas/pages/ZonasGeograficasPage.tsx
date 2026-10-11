import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { ZonaAsignaciones } from "../components/ZonaAsignaciones";
import { ZonaDetalle } from "../components/ZonaDetalle";
import { ZonaForm } from "../components/ZonaForm";
import { ZonasTable } from "../components/ZonasTable";
import { useZonasGeograficas } from "../hooks/useZonasGeograficas";
import {
  useCrearZona,
  useEliminarZona,
  useActualizarZona,
} from "../hooks/useZonasGeograficasMutations";
import type { ZonaGeograficaResponse } from "../types/zonaGeografica";

/**
 * `tipo` solo elige el subtitulo: las cuatro rutas de zonas listan el mismo
 * conjunto. El filtro por tipo existe en el backend (`esEntidadEspecial`) pero
 * todavia no se cablea desde aqui.
 */
interface ZonasGeograficasPageProps {
  tipo?: "E" | "P";
}

export function ZonasGeograficasPage({ tipo }: ZonasGeograficasPageProps) {
  const { data: zonas, isLoading } = useZonasGeograficas();

  const [seleccionada, setSeleccionada] = useState<ZonaGeograficaResponse | null>(null);
  const [verZona, setVerZona] = useState<ZonaGeograficaResponse | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  /** Un clic solo selecciona y muestra el detalle; editar es un paso aparte. */
  const [editando, setEditando] = useState(false);
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
          toast.success("Zona geográfica creada correctamente");
        },
        onError,
      });
    } else if (seleccionada) {
      actualizar.mutate(
        { id: seleccionada.id, input },
        {
          onSuccess: (zonaActualizada) => {
            setSeleccionada(zonaActualizada);
            toast.success("Zona geográfica actualizada correctamente");
          },
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionada) return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la zona "${seleccionada.nombre}"?`)) {
      return;
    }
    setMensajeError(null);
    eliminar.mutate(seleccionada.id, {
      onSuccess: () => {
        setSeleccionada(null);
        toast.success("Zona geográfica eliminada correctamente");
      },
      onError: (error) => {
        const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
        setMensajeError(msg);
        toast.error(msg);
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
            setEditando(false);
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
        onSeleccionar={(zona) => {
          setSeleccionada(zona);
          setCreandoNueva(false);
          setEditando(false);
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

      {mostrarDetalle && seleccionada ? (
        <ZonaDetalle
          zona={seleccionada}
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
          <ZonaForm
            zona={zonaEnEdicion}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setCreandoNueva(false);
              setEditando(false);
              setMensajeError(null);
            }}
            onEliminar={seleccionada ? handleEliminar : undefined}
            isPending={crear.isPending || actualizar.isPending}
            isDeleting={eliminar.isPending}
          />
        </div>
      ) : null}
    </div>
  );
}
