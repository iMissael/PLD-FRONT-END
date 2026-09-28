import { useMemo, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";

import { useZonasGeograficasSelect } from "../../zonas-geograficas/hooks/useZonasGeograficas";
import { BusquedaPaisesForm, type FiltroPaises } from "../components/BusquedaPaisesForm";
import { PaisDetalle } from "../components/PaisDetalle";
import { PaisForm } from "../components/PaisForm";
import { PaisesTable } from "../components/PaisesTable";
import { usePaises } from "../hooks/usePaises";
import { useActualizarPais, useEliminarPais } from "../hooks/usePaisesMutations";
import type { ActualizarPaisInput, PaisResponse } from "../types/pais";

const PAISES_POR_PAGINA = 15;

/**
 * Normaliza texto para comparar en la búsqueda: mayúsculas y sin acentos,
 * así "mexico" encuentra "MÉXICO" sin que el usuario tenga que escribir el
 * acento.
 */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

/**
 * Catálogo de países: es de solo edición. El catálogo de países se carga
 * por migración (CSV) y no se dan de alta países nuevos desde esta
 * pantalla — solo se puede ver el detalle y editar los datos de un país
 * ya existente (y desactivarlo con el soft-delete).
 */
export function PaisesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroPaises>("PAIS");
  const [pagina, setPagina] = useState(1);

  // Se trae el catálogo completo una sola vez y el filtrado (por nombre/código
  // de país o por nombre de zona) se hace aquí mismo, en memoria, para que la
  // búsqueda responda al instante con cada letra en vez de ir al backend en
  // cada tecla.
  const { data: paisesBackend, isLoading } = usePaises();
  const { data: zonas } = useZonasGeograficasSelect();

  const nombresDeZona = useMemo(() => {
    const mapa: Record<string, string> = {};
    zonas?.forEach((zona) => {
      mapa[zona.id] = zona.nombre;
    });
    return mapa;
  }, [zonas]);

  const paisesFiltrados = useMemo(() => {
    if (!paisesBackend) return paisesBackend;
    const termino = normalizar(busqueda.trim());
    if (!termino) return paisesBackend;

    if (filtro === "ZONA") {
      return paisesBackend.filter((pais) =>
        pais.zonasAsignadas.some((id) =>
          normalizar(nombresDeZona[id] ?? "").includes(termino),
        ),
      );
    }

    return paisesBackend.filter(
      (pais) =>
        normalizar(pais.nombre).includes(termino) ||
        normalizar(pais.codigoIso ?? "").includes(termino),
    );
  }, [paisesBackend, filtro, busqueda, nombresDeZona]);

  const totalPaginas = Math.max(
    1,
    Math.ceil((paisesFiltrados?.length ?? 0) / PAISES_POR_PAGINA),
  );
  const paginaActual = Math.min(pagina, totalPaginas);
  const paises = useMemo(() => {
    if (!paisesFiltrados) return paisesFiltrados;
    const inicio = (paginaActual - 1) * PAISES_POR_PAGINA;
    return paisesFiltrados.slice(inicio, inicio + PAISES_POR_PAGINA);
  }, [paisesFiltrados, paginaActual]);

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
        <h2 className="text-xl font-semibold text-slate-900">Configuración de países</h2>
        <p className="text-sm text-slate-500">
          Consulta el catálogo de países y edita la nacionalidad, el código ISO y las
          zonas de riesgo asignadas.
        </p>
      </div>

      {mensajeError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {mensajeError}
        </p>
      ) : null}

      <BusquedaPaisesForm
        onBuscar={(texto, nuevoFiltro) => {
          setBusqueda(texto);
          setFiltro(nuevoFiltro);
          setPagina(1);
        }}
      />

      <PaisesTable
        paises={paises}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.idPais ?? null}
        nombresDeZona={nombresDeZona}
        onSeleccionar={(pais) => {
          setSeleccionado(pais);
          setEditando(false);
          setMensajeError(null);
        }}
      />

      {!isLoading && (paisesFiltrados?.length ?? 0) > 0 ? (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {paisesFiltrados?.length} país{paisesFiltrados?.length === 1 ? "" : "es"} —
            página {paginaActual} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}

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
          <button
            type="button"
            onClick={handleEliminar}
            disabled={eliminar.isPending}
            className="self-start rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {eliminar.isPending ? "Eliminando..." : "Eliminar país"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
