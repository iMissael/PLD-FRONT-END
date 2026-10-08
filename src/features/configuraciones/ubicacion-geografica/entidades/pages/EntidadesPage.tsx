import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";

import { useZonasGeograficasSelect } from "../../zonas-geograficas/hooks/useZonasGeograficas";
import { EntidadDetalle, type ZonaConNivel } from "../components/EntidadDetalle";
import { EntidadForm } from "../components/EntidadForm";
import { useEntidades } from "../hooks/useEntidades";
import {
  useActualizarEntidad,
  useCrearEntidad,
  useEliminarEntidad,
} from "../hooks/useEntidadesMutations";
import type { CrearEntidadInput, EntidadResponse } from "../types/entidad";

/**
 * Normaliza texto para comparar en la búsqueda: mayúsculas y sin acentos.
 */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

/** Ids de las zonas de la entidad: la relacion es muchos a muchos, con `idZona` como respaldo. */
function idsDeZona(entidad: EntidadResponse): string[] {
  if (Array.isArray(entidad.zonasAsignadas) && entidad.zonasAsignadas.length > 0) {
    return entidad.zonasAsignadas;
  }
  return entidad.idZona ? [entidad.idZona] : [];
}

export function EntidadesPage() {
  const { data: entidades, isLoading } = useEntidades();
  const { data: zonas } = useZonasGeograficasSelect();

  const mapaZonas = useMemo(() => {
    const mapa: Record<
      string,
      { nombre: string; nivelRiesgoDescripcion: string; nivelRiesgoValor: number }
    > = {};
    const listaZonas = Array.isArray(zonas)
      ? zonas
      : Array.isArray((zonas as unknown as { contenido?: typeof zonas })?.contenido)
      ? ((zonas as unknown as { contenido: typeof zonas }).contenido ?? [])
      : [];
    listaZonas.forEach((z) => {
      mapa[z.id] = {
        nombre: z.nombre,
        nivelRiesgoDescripcion: z.nivelRiesgoDescripcion,
        nivelRiesgoValor: z.nivelRiesgoValor,
      };
    });
    return mapa;
  }, [zonas]);

  const [seleccionada, setSeleccionada] = useState<EntidadResponse | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  /** Un clic solo selecciona y muestra el detalle; editar es un paso aparte. */
  const [editando, setEditando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const crear = useCrearEntidad();
  const actualizar = useActualizarEntidad();
  const eliminar = useEliminarEntidad();

  const entidadEnEdicion = creandoNueva ? null : seleccionada;
  const mostrarFormulario = creandoNueva || (seleccionada !== null && editando);
  const mostrarDetalle = !creandoNueva && seleccionada !== null && !editando;

  const handleGuardar = (input: CrearEntidadInput) => {
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
          toast.success("Entidad creada correctamente");
        },
        onError,
      });
    } else if (seleccionada) {
      actualizar.mutate(
        { id: seleccionada.idEntidad, input },
        {
          onSuccess: (entidadActualizada) => {
            setSeleccionada(entidadActualizada);
            toast.success("Entidad actualizada correctamente");
          },
          onError,
        },
      );
    }
  };

  const handleEliminar = () => {
    if (!seleccionada) return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la entidad "${seleccionada.nombre}"?`)) {
      return;
    }
    setMensajeError(null);
    eliminar.mutate(seleccionada.idEntidad, {
      onSuccess: () => {
        setSeleccionada(null);
        toast.success("Entidad eliminada correctamente");
      },
      onError: (error) => {
        const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
        setMensajeError(msg);
        toast.error(msg);
      },
    });
  };

  const handleEditar = (entidad: EntidadResponse) => {
    setSeleccionada(entidad);
    setCreandoNueva(false);
    setEditando(true);
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
        header: "Zona de riesgo",
        cell: (item: EntidadResponse) => {
          const zonaIds = idsDeZona(item);
          const nombres = zonaIds
            .map((id: string) => mapaZonas[id]?.nombre ?? id)
            .filter((nombre): nombre is string => Boolean(nombre));
          if (nombres.length > 0) return nombres.join(", ");
          if (item.nombreZona) return item.nombreZona;
          return "—";
        },
      },
      {
        header: "Nivel de riesgo",
        cell: (item: EntidadResponse) => {
          const zonaIds = idsDeZona(item);
          const niveles = zonaIds
            .map((id: string) => {
              const info = mapaZonas[id];
              return info
                ? `${info.nivelRiesgoDescripcion} (${info.nivelRiesgoValor})`
                : null;
            })
            .filter((n): n is string => Boolean(n));
          if (niveles.length > 0) return niveles.join(", ");
          if (item.nivelRiesgoDescripcion) {
            return `${item.nivelRiesgoDescripcion} (${item.nivelRiesgoValor ?? 0})`;
          }
          return "—";
        },
      },
    ],
    [mapaZonas],
  );

  const listaEntidades = useMemo(() => {
    if (Array.isArray(entidades)) return entidades;
    if (Array.isArray((entidades as unknown as { contenido?: EntidadResponse[] })?.contenido)) {
      return (entidades as unknown as { contenido: EntidadResponse[] }).contenido ?? [];
    }
    return [];
  }, [entidades]);

  /**
   * Cada zona con su nivel emparejado, para la lista del panel de detalle. El
   * catalogo de zonas es la fuente preferida; si no resuelve, se cae a lo que
   * el propio registro trae, que el backend solo manda de la primera zona.
   */
  const detalleZonas = useMemo<ZonaConNivel[]>(() => {
    if (!seleccionada) return [];
    const nivelDelRegistro = seleccionada.nivelRiesgoDescripcion
      ? `${seleccionada.nivelRiesgoDescripcion} (${seleccionada.nivelRiesgoValor ?? 0})`
      : null;
    const ids = idsDeZona(seleccionada);
    if (ids.length === 0) {
      if (!seleccionada.nombreZona) return [];
      return [
        {
          id: seleccionada.idZona ?? seleccionada.nombreZona,
          nombre: seleccionada.nombreZona,
          nivelRiesgo: nivelDelRegistro,
        },
      ];
    }
    return ids.map((id) => {
      const info = mapaZonas[id];
      if (info) {
        return {
          id,
          nombre: info.nombre,
          nivelRiesgo: `${info.nivelRiesgoDescripcion} (${info.nivelRiesgoValor})`,
        };
      }
      const esLaDelRegistro = seleccionada.idZona === id;
      return {
        id,
        nombre: esLaDelRegistro && seleccionada.nombreZona ? seleccionada.nombreZona : id,
        nivelRiesgo: esLaDelRegistro ? nivelDelRegistro : null,
      };
    });
  }, [seleccionada, mapaZonas]);

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
            setEditando(false);
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
          setEditando(false);
          setMensajeError(null);
        }}
        onRowDoubleClick={handleEditar}
        doubleClickTitle="Doble clic para modificar este registro"
        search={{
          placeholder: "Buscar entidad por nombre, clave CURP o zona...",
          filterFn: (entidad: EntidadResponse, query: string) => {
            const q = normalizar(query);
            const zonaIds = idsDeZona(entidad);
            const nombresZonas = zonaIds
              .map((id: string) => mapaZonas[id]?.nombre ?? id)
              .join(" ");
            return (
              normalizar(entidad.nombre ?? "").includes(q) ||
              normalizar(entidad.claveCurp ?? "").includes(q) ||
              normalizar(nombresZonas).includes(q) ||
              normalizar(entidad.nombreZona ?? "").includes(q) ||
              normalizar(entidad.nombrePais ?? "").includes(q)
            );
          },
        }}
        pagination={{
          mode: "client",
          defaultRowsPerPage: 10,
          rowsPerPageOptions: [10, 15, 25, 30],
        }}
      />

      {mostrarDetalle && seleccionada ? (
        <EntidadDetalle
          entidad={seleccionada}
          zonas={detalleZonas}
          onEditar={() => handleEditar(seleccionada)}
        />
      ) : null}

      {mostrarFormulario ? (
        <div ref={formRef} className="flex flex-col gap-3 scroll-mt-4">
          <EntidadForm
            entidad={entidadEnEdicion}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setCreandoNueva(false);
              setEditando(false);
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
