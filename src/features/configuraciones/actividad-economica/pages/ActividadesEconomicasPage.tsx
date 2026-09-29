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

const FILAS_POR_PAGINA = 50;

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
  const [pagina, setPagina] = useState(0);
  const [seleccionada, setSeleccionada] = useState<ActividadEconomicaResponse | null>(
    null,
  );
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const crear = useCrearActividadEconomica();
  const actualizar = useActualizarActividadEconomica();
  const eliminar = useEliminarActividadEconomica();

  // El backend devuelve el catálogo completo; el filtro corre en memoria.
  // Se depende de `actividades` (la referencia estable de TanStack Query) en
  // vez de un `?? []` intermedio, que cambiaría en cada render.
  const filtradas = useMemo(() => {
    const lista = actividades ?? [];
    const termino = normalizar(busqueda.trim());
    if (!termino) return lista;
    return lista.filter((actividad) =>
      normalizar(actividad.descripcion).includes(termino),
    );
  }, [actividades, busqueda]);

  const totalGeneral = actividades?.length ?? 0;

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / FILAS_POR_PAGINA));
  // Si el filtro reduce los resultados, la página actual puede quedar fuera de
  // rango; se acota al vuelo en vez de resetearla en un efecto.
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const offset = paginaActual * FILAS_POR_PAGINA;
  const pagina_actual_filas = filtradas.slice(offset, offset + FILAS_POR_PAGINA);

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
          onSuccess: (actividadActualizada) => setSeleccionada(actividadActualizada),
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
          setPagina(0);
        }}
        totalFiltrado={filtradas.length}
        totalGeneral={totalGeneral}
      />

      <ActividadesEconomicasTable
        actividades={pagina_actual_filas}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        onSeleccionar={(actividad) => {
          setSeleccionada(actividad);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
        offset={offset}
      />

      {filtradas.length > FILAS_POR_PAGINA ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Mostrando {offset + 1}–{Math.min(offset + FILAS_POR_PAGINA, filtradas.length)}{" "}
            de {filtradas.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variante="secundario"
              className="px-3 py-1"
              onClick={() => setPagina((prev) => Math.max(0, prev - 1))}
              disabled={paginaActual === 0}
            >
              Anterior
            </Button>
            <span className="text-muted-foreground">
              Página {paginaActual + 1} de {totalPaginas}
            </span>
            <Button
              variante="secundario"
              className="px-3 py-1"
              onClick={() => setPagina((prev) => Math.min(totalPaginas - 1, prev + 1))}
              disabled={paginaActual >= totalPaginas - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

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
