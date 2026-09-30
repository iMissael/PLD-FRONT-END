import { useMemo, useRef, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";

import { EntidadForm } from "../components/EntidadForm";
import { useEntidades } from "../hooks/useEntidades";
import {
  useActualizarEntidad,
  useCrearEntidad,
  useEliminarEntidad,
} from "../hooks/useEntidadesMutations";
import type { CrearEntidadInput, EntidadResponse } from "../types/entidad";

/**
 * Normaliza texto para comparar en la búsqueda: mayúsculas y sin acentos,
 * así "mexico" encuentra "MÉXICO" sin que el usuario tenga que escribir el
 * acento.
 */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

export function EntidadesPage() {
  const { data: entidades, isLoading } = useEntidades();

  const [seleccionada, setSeleccionada] = useState<EntidadResponse | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

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
      crear.mutate(input, {
        onSuccess: () => setCreandoNueva(false),
        onError,
      });
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

  const handleEditar = (entidad: EntidadResponse) => {
    setSeleccionada(entidad);
    setCreandoNueva(false);
    setMensajeError(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const columns: ColumnDef<EntidadResponse>[] = useMemo(
    () => [
      {
        header: "Clave CURP",
        accessorKey: "claveCurp",
        className: "font-mono font-semibold text-foreground",
        width: "120px",
      },
      {
        header: "Nombre",
        accessorKey: "nombre",
        className: "font-medium text-foreground",
      },
      {
        header: "País",
        accessorKey: "nombrePais",
        className: "text-muted-foreground",
      },
      {
        header: "Zona",
        accessorKey: "nombreZona",
        className: "text-muted-foreground",
      },
      {
        header: "Nivel de riesgo",
        cell: (item) =>
          item.nivelRiesgoDescripcion
            ? `${item.nivelRiesgoDescripcion} (${item.nivelRiesgoValor})`
            : "—",
      },
    ],
    [],
  );

  const listaEntidades = useMemo(() => {
    if (Array.isArray(entidades)) return entidades;
    if (Array.isArray((entidades as unknown as { contenido?: EntidadResponse[] })?.contenido)) {
      return (entidades as unknown as { contenido: EntidadResponse[] }).contenido;
    }
    return [];
  }, [entidades]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Entidades</h2>
          <p className="text-sm text-muted-foreground">
            Administra las entidades federativas y su zona de riesgo asignada.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNueva(true);
            setSeleccionada(null);
            setMensajeError(null);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 50);
          }}
        >
          Nueva entidad
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <DataTable
        data={listaEntidades}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="Cargando entidades..."
        emptyMessage="No hay entidades registradas."
        seleccionadoId={seleccionada?.idEntidad ?? null}
        getRowId={(entidad) => entidad.idEntidad}
        onRowClick={(entidad) => {
          setSeleccionada(entidad);
          setCreandoNueva(false);
          setMensajeError(null);
        }}
        onRowDoubleClick={handleEditar}
        doubleClickTitle="Doble clic para modificar este registro"
        search={{
          placeholder: "Buscar entidad por nombre, clave CURP o zona...",
          filterFn: (entidad, query) => {
            const q = normalizar(query);
            return (
              normalizar(entidad.nombre).includes(q) ||
              normalizar(entidad.claveCurp ?? "").includes(q) ||
              normalizar(entidad.nombreZona ?? "").includes(q) ||
              normalizar(entidad.nombrePais ?? "").includes(q)
            );
          },
        }}
        pagination={{
          mode: "client",
          defaultRowsPerPage: 10,
          rowsPerPageOptions: [5, 10, 15, 25, 50],
        }}
      />

      {mostrarFormulario ? (
        <div ref={formRef} className="flex flex-col gap-3 scroll-mt-4">
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
