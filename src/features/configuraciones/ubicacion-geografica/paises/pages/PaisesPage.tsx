import { useMemo, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { useZonasGeograficasSelect } from "../../zonas-geograficas/hooks/useZonasGeograficas";
import { PaisDetalle } from "../components/PaisDetalle";
import { PaisForm } from "../components/PaisForm";
import { PaisesTable } from "../components/PaisesTable";
import { usePaises } from "../hooks/usePaises";
import { useActualizarPais, useEliminarPais } from "../hooks/usePaisesMutations";
import type { ActualizarPaisInput, PaisResponse } from "../types/pais";

export function PaisesPage() {
  const { data: paisesBackend, isLoading } = usePaises();
  const { data: zonas } = useZonasGeograficasSelect();

  const nombresDeZona = useMemo(() => {
    const mapa: Record<string, string> = {};
    const listaZonas = Array.isArray(zonas)
      ? zonas
      : Array.isArray((zonas as unknown as { contenido?: typeof zonas })?.contenido)
      ? ((zonas as unknown as { contenido: typeof zonas }).contenido ?? [])
      : [];
    listaZonas.forEach((zona) => {
      mapa[zona.id] = zona.nombre;
    });
    return mapa;
  }, [zonas]);

  const [seleccionado, setSeleccionado] = useState<PaisResponse | null>(null);
  const [editando, setEditando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const actualizar = useActualizarPais();
  const eliminar = useEliminarPais();

  const mostrarFormulario = seleccionado !== null && editando;

  const handleGuardar = (input: ActualizarPaisInput) => {
    if (!seleccionado) return;
    setMensajeError(null);
    actualizar.mutate(
      { id: seleccionado.idPais, input },
      {
        onSuccess: (paisActualizado) => {
          setSeleccionado(paisActualizado);
          setEditando(false);
        },
        onError: (error) => {
          setMensajeError(
            isAppError(error) ? error.message : "Ocurrió un error inesperado.",
          );
        },
      },
    );
  };

  const handleEliminar = () => {
    if (!seleccionado) return;
    setMensajeError(null);
    eliminar.mutate(seleccionado.idPais, {
      onSuccess: () => {
        setSeleccionado(null);
        setEditando(false);
      },
      onError: (error) => {
        setMensajeError(
          isAppError(error) ? error.message : "Ocurrió un error inesperado.",
        );
      },
    });
  };

  const nombresZonasSeleccionado = seleccionado
    ? seleccionado.zonasAsignadas
        .map((id) => nombresDeZona[id])
        .filter((nombre): nombre is string => Boolean(nombre))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Configuración de países</h2>
        <p className="text-sm text-muted-foreground">
          Consulta el catálogo de países y edita la nacionalidad, el código ISO y las
          zonas de riesgo asignadas.
        </p>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <PaisesTable
        paises={paisesBackend}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.idPais ?? null}
        nombresDeZona={nombresDeZona}
        onSeleccionar={(pais) => {
          setSeleccionado(pais);
          setEditando(false);
          setMensajeError(null);
        }}
        onDoubleClick={(pais) => {
          setSeleccionado(pais);
          setEditando(true);
          setMensajeError(null);
        }}
      />

      {seleccionado && !editando ? (
        <PaisDetalle
          pais={seleccionado}
          nombresZonas={nombresZonasSeleccionado}
          onEditar={() => setEditando(true)}
        />
      ) : null}

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <PaisForm
            pais={seleccionado}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setEditando(false);
              setMensajeError(null);
            }}
            isPending={actualizar.isPending}
          />
          <Button
            variante="peligro"
            className="self-start"
            onClick={handleEliminar}
            disabled={eliminar.isPending}
          >
            {eliminar.isPending ? "Eliminando..." : "Eliminar país"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
