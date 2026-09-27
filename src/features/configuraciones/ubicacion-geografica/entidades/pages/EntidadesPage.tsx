import { useMemo, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/Button";

import {
  BusquedaEntidadesForm,
  type FiltroEntidades,
} from "../components/BusquedaEntidadesForm";
import { EntidadForm } from "../components/EntidadForm";
import { EntidadesTable } from "../components/EntidadesTable";
import { useEntidades } from "../hooks/useEntidades";
import {
  useActualizarEntidad,
  useCrearEntidad,
  useEliminarEntidad,
} from "../hooks/useEntidadesMutations";
import type { CrearEntidadInput, EntidadResponse } from "../types/entidad";

const ENTIDADES_POR_PAGINA = 15;

/**
 * Normaliza texto para comparar en la búsqueda: mayúsculas y sin acentos,
 * así "mexico" encuentra "MÉXICO" sin que el usuario tenga que escribir el
 * acento. Igual que en Países.
 */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
}

export function EntidadesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroEntidades>("ENTIDAD");
  const [pagina, setPagina] = useState(1);

  // Se trae el catálogo completo una sola vez (es pequeño, un puñado de
  // entidades) y el filtrado (por nombre/clave CURP o por nombre de zona)
  // se hace aquí mismo, en memoria, para que la búsqueda responda al
  // instante con cada letra en vez de ir al backend en cada tecla — igual
  // que en Países.
  const { data: entidadesBackend, isLoading } = useEntidades();

  const entidadesFiltradas = useMemo(() => {
    if (!entidadesBackend) return entidadesBackend;
    const termino = normalizar(busqueda.trim());
    if (!termino) return entidadesBackend;

    if (filtro === "ZONA") {
      return entidadesBackend.filter((entidad) =>
        normalizar(entidad.nombreZona ?? "").includes(termino),
      );
    }

    return entidadesBackend.filter(
      (entidad) =>
        normalizar(entidad.nombre).includes(termino) ||
        normalizar(entidad.claveCurp ?? "").includes(termino),
    );
  }, [entidadesBackend, filtro, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil((entidadesFiltradas?.length ?? 0) / ENTIDADES_POR_PAGINA),
  );
  const paginaActual = Math.min(pagina, totalPaginas);
  const entidades = useMemo(() => {
    if (!entidadesFiltradas) return entidadesFiltradas;
    const inicio = (paginaActual - 1) * ENTIDADES_POR_PAGINA;
    return entidadesFiltradas.slice(inicio, inicio + ENTIDADES_POR_PAGINA);
  }, [entidadesFiltradas, paginaActual]);

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
          <h2 className="text-xl font-semibold text-fg">Entidades</h2>
          <p className="text-sm text-muted">
            Administra las entidades federativas y su zona de riesgo asignada.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
            setMensajeError(null);
          }}
        >
          Nueva entidad
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <BusquedaEntidadesForm
        onBuscar={(texto, nuevoFiltro) => {
          setBusqueda(texto);
          setFiltro(nuevoFiltro);
          setPagina(1);
        }}
      />

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

      {!isLoading && (entidadesFiltradas?.length ?? 0) > 0 ? (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {entidadesFiltradas?.length} entidad
            {entidadesFiltradas?.length === 1 ? "" : "es"} — página {paginaActual} de{" "}
            {totalPaginas}
          </span>
          <div className="flex gap-2">
            <Button
              variante="secundario"
              className="px-3 py-1.5"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
            >
              Anterior
            </Button>
            <Button
              variante="secundario"
              className="px-3 py-1.5"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

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
            <Button
              variante="peligro"
              className="self-start"
              onClick={handleEliminar}
              disabled={eliminar.isPending}
            >
              {eliminar.isPending ? "Eliminando..." : "Eliminar entidad"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
