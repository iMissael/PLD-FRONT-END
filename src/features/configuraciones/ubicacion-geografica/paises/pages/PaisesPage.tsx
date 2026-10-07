import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import {
  useListasDePais,
  useListasPaisesSelect,
  useTodosLosPaisesConListas,
} from "../../listas-paises/hooks/useListasPaises";
import type { PaisAsignadoResponse } from "../../listas-paises/types/listaPais";
import { PaisDetalle, type ItemListaDetalle } from "../components/PaisDetalle";
import { PaisForm } from "../components/PaisForm";
import { PaisesTable, type InfoListaPais, type InfoRiesgoPais } from "../components/PaisesTable";
import { usePaises } from "../hooks/usePaises";
import { useActualizarPais, useEliminarPais } from "../hooks/usePaisesMutations";
import type { ActualizarPaisInput, PaisResponse } from "../types/pais";

export function PaisesPage() {
  const { data: paisesBackend, isLoading } = usePaises();
  const { data: listas } = useListasPaisesSelect();
  const { data: paisesConListas } = useTodosLosPaisesConListas();

  const mapaListas = useMemo(() => {
    const mapa: Record<string, InfoListaPais> = {};
    const listaItems = Array.isArray(listas)
      ? listas
      : Array.isArray((listas as unknown as { contenido?: typeof listas })?.contenido)
      ? ((listas as unknown as { contenido: typeof listas }).contenido ?? [])
      : [];
    listaItems.forEach((lista) => {
      mapa[lista.id] = {
        nombre: lista.nombre,
        nivelRiesgoDescripcion: lista.nivelRiesgoDescripcion,
        nivelRiesgoValor: lista.nivelRiesgoValor,
      };
    });
    return mapa;
  }, [listas]);

  const mapaRiesgoPais = useMemo(() => {
    const mapa: Record<string, InfoRiesgoPais> = {};
    const items = Array.isArray(paisesConListas)
      ? paisesConListas
      : Array.isArray((paisesConListas as unknown as { contenido?: PaisAsignadoResponse[] })?.contenido)
      ? ((paisesConListas as unknown as { contenido: PaisAsignadoResponse[] }).contenido ?? [])
      : [];

    items.forEach((p) => {
      if (p.id) {
        const actual = mapa[p.id];
        if (
          !actual ||
          (p.nivelRiesgoValor !== undefined && p.nivelRiesgoValor > actual.nivelRiesgoValor)
        ) {
          mapa[p.id] = {
            nivelRiesgoDescripcion: p.nivelRiesgoDescripcion ?? "—",
            nivelRiesgoValor: p.nivelRiesgoValor ?? 0,
          };
        }
      }
    });
    return mapa;
  }, [paisesConListas]);

  const [seleccionado, setSeleccionado] = useState<PaisResponse | null>(null);
  const [editando, setEditando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const { data: listasAsignadasPais } = useListasDePais(seleccionado?.idPais);

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
          toast.success("País actualizado correctamente");
        },
        onError: (error) => {
          const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
          setMensajeError(msg);
          toast.error(msg);
        },
      },
    );
  };

  const handleEliminar = () => {
    if (!seleccionado) return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el país "${seleccionado.nombre}"?`)) {
      return;
    }
    setMensajeError(null);
    eliminar.mutate(seleccionado.idPais, {
      onSuccess: () => {
        setSeleccionado(null);
        setEditando(false);
        toast.success("País eliminado correctamente");
      },
      onError: (error) => {
        const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
        setMensajeError(msg);
        toast.error(msg);
      },
    });
  };

  const handleEditar = (pais: PaisResponse) => {
    setSeleccionado(pais);
    setEditando(true);
    setMensajeError(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const listasDetalleSeleccionado = useMemo<ItemListaDetalle[]>(() => {
    if (!seleccionado) return [];
    if (listasAsignadasPais && Array.isArray(listasAsignadasPais)) {
      return listasAsignadasPais.map((l) => ({
        nombre: l.nombre,
        nivelRiesgoDescripcion: l.nivelRiesgoDescripcion,
        nivelRiesgoValor: l.nivelRiesgoValor,
      }));
    }
    const asignadas = Array.isArray(seleccionado.zonasAsignadas)
      ? seleccionado.zonasAsignadas
      : [];
    const items: ItemListaDetalle[] = [];
    asignadas.forEach((id) => {
      const info = mapaListas[id];
      if (info) {
        items.push({
          nombre: info.nombre,
          nivelRiesgoDescripcion: info.nivelRiesgoDescripcion,
          nivelRiesgoValor: info.nivelRiesgoValor,
        });
      }
    });
    return items;
  }, [seleccionado, listasAsignadasPais, mapaListas]);

  const riesgoSeleccionado = useMemo(() => {
    if (!seleccionado) return null;
    if (mapaRiesgoPais[seleccionado.idPais]) {
      return mapaRiesgoPais[seleccionado.idPais];
    }
    if (listasDetalleSeleccionado.length > 0) {
      let max: InfoRiesgoPais | null = null;
      for (const l of listasDetalleSeleccionado) {
        if (l.nivelRiesgoValor !== undefined) {
          if (!max || l.nivelRiesgoValor > max.nivelRiesgoValor) {
            max = {
              nivelRiesgoDescripcion: l.nivelRiesgoDescripcion ?? "—",
              nivelRiesgoValor: l.nivelRiesgoValor,
            };
          }
        }
      }
      return max;
    }
    return null;
  }, [seleccionado, mapaRiesgoPais, listasDetalleSeleccionado]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Configuración de países</h2>
        <p className="text-sm text-muted-foreground">
          Consulta el catálogo de países y edita la nacionalidad, el código ISO y las
          listas de riesgo asociadas.
        </p>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <PaisesTable
        paises={paisesBackend}
        isLoading={isLoading}
        seleccionadoId={seleccionado?.idPais ?? null}
        mapaListas={mapaListas}
        mapaRiesgoPais={mapaRiesgoPais}
        onSeleccionar={(pais) => {
          setSeleccionado(pais);
          setEditando(false);
          setMensajeError(null);
        }}
        onDoubleClick={handleEditar}
      />

      {seleccionado && !editando ? (
        <PaisDetalle
          pais={seleccionado}
          listas={listasDetalleSeleccionado}
          nivelRiesgo={riesgoSeleccionado}
          onEditar={() => handleEditar(seleccionado)}
        />
      ) : null}

      {mostrarFormulario ? (
        <div ref={formRef} className="flex flex-col gap-3 scroll-mt-4">
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
