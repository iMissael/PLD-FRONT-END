import { useMemo, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { ActividadEconomicaForm } from "../components/ActividadEconomicaForm";
import { ActividadesEconomicasTable } from "../components/ActividadesEconomicasTable";
import { BusquedaActividadesForm } from "../components/BusquedaActividadesForm";
import { useActividadesEconomicas } from "../hooks/useActividadesEconomicas";
import {
  useActualizarActividadEconomica,
  useCrearActividadEconomica,
  useEliminarActividadEconomica,
} from "../hooks/useActividadesEconomicasMutations";
import type { ActividadEconomicaResponse } from "../types/actividadEconomica";

/** Quita acentos para que "nomina" encuentre "Consumo Nómina". */
function normalizar(texto: string): string {
  return (
    texto
      .toLowerCase()
      .normalize("NFD")
      // Rango de marcas diacríticas combinantes que deja NFD.
      .replace(/[̀-ͯ]/g, "")
  );
}

export function ActividadesEconomicasPage() {
  const { data: actividades, isLoading } = useActividadesEconomicas();

  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState<ActividadEconomicaResponse | null>(
    null,
  );
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearActividadEconomica();
  const actualizar = useActualizarActividadEconomica();
  const eliminar = useEliminarActividadEconomica();

  // El backend devuelve el catálogo completo; el filtro corre en memoria.
  const listaActividades: ActividadEconomicaResponse[] = useMemo(() => {
    if (!actividades) return [];
    if (Array.isArray(actividades)) return actividades;
    if (Array.isArray((actividades as unknown as { contenido?: ActividadEconomicaResponse[] })?.contenido)) {
      return (actividades as unknown as { contenido: ActividadEconomicaResponse[] }).contenido ?? [];
    }
    return [];
  }, [actividades]);

  const filtradas: ActividadEconomicaResponse[] = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    if (!termino) return listaActividades;
    return listaActividades.filter((actividad: ActividadEconomicaResponse) =>
      normalizar(actividad.descripcion).includes(termino) ||
      normalizar(actividad.claveSat).includes(termino),
    );
  }, [listaActividades, busqueda]);

  const totalGeneral = listaActividades.length;

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
          onSuccess: (actividadActualizada: ActividadEconomicaResponse) => setSeleccionada(actividadActualizada),
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

  const actividadEnEdicion = creandoNueva ? null : seleccionada;
  const mostrarFormulario = creandoNueva || seleccionada !== null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Actividad económica</h2>
          <p className="text-sm text-muted-foreground">
            Catálogo de actividades económicas (claves SAT) y su nivel de riesgo PLD.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
            setMensajeError(null);
          }}
        >
          Nueva actividad
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <BusquedaActividadesForm
        valor={busqueda}
        onCambiar={(valor) => {
          setBusqueda(valor);
        }}
        totalFiltrado={filtradas.length}
        totalGeneral={totalGeneral}
      />

      <ActividadesEconomicasTable
        actividades={filtradas}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        onSeleccionar={(actividad) => {
          setSeleccionada(actividad);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
        onDoubleClick={(actividad) => {
          setSeleccionada(actividad);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
      />

      {mostrarFormulario ? (
        <div className="flex flex-col gap-3">
          <ActividadEconomicaForm
            actividad={actividadEnEdicion}
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
              {eliminar.isPending ? "Dando de baja..." : "Dar de baja"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
