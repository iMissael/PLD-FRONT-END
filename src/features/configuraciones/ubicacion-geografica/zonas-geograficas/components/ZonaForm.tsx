import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, hint, label } from "@/shared/components/ui/styles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";

import { NivelRiesgoSelect } from "../../niveles-riesgo/components/NivelRiesgoSelect";
import type {
  CrearZonaGeograficaInput,
  EstatusZona,
  ZonaGeograficaResponse,
} from "../types/zonaGeografica";

interface ZonaFormProps {
  zona: ZonaGeograficaResponse | null;
  onGuardar: (input: CrearZonaGeograficaInput) => void;
  onCancelar: () => void;
  onEliminar?: () => void;
  isPending?: boolean;
  isDeleting?: boolean;
}

interface FormState {
  nombre: string;
  nivelRiesgoId: number | "";
  esEntidadEspecial: boolean;
  estatus: EstatusZona;
}

function aFormState(zona: ZonaGeograficaResponse | null): FormState {
  if (!zona) {
    return {
      nombre: "",
      nivelRiesgoId: "",
      esEntidadEspecial: false,
      estatus: "A",
    };
  }
  return {
    nombre: zona.nombre,
    nivelRiesgoId: zona.nivelRiesgoId,
    esEntidadEspecial: zona.esEntidadEspecial ?? false,
    estatus: zona.estatus,
  };
}

/**
 * Formulario de alta/edición de una zona geográfica. La asignación de
 * entidades/países vive aparte (ZonaAsignaciones), porque el backend la
 * expone como sub-recursos independientes (`PUT /{id}/entidades|paises`).
 */
export function ZonaForm({
  zona,
  onGuardar,
  onCancelar,
  onEliminar,
  isPending,
  isDeleting,
}: ZonaFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(zona));

  useEffect(() => {
    setForm(aFormState(zona));
  }, [zona]);

  const esNueva = zona === null;

  /**
   * Las zonas que no son de entidades especiales son catalogo fijo
   */
  const soloNivelRiesgo = !esNueva && !form.esEntidadEspecial;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.nivelRiesgoId === "") return;
    onGuardar({
      nombre: form.nombre.trim(),
      idNivelRiesgo: form.nivelRiesgoId,
      esEntidadEspecial: form.esEntidadEspecial,
      estatus: form.estatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {esNueva ? "Nueva zona geográfica" : `Editar zona: ${zona.nombre}`}
        </h3>

        {/* Las zonas que no son de entidades especiales son catalogo fijo: no se dan de baja. */}
        {!esNueva && onEliminar && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variante="peligro"
                size="sm"
                disabled={isDeleting || isPending || soloNivelRiesgo}
                title={
                  soloNivelRiesgo
                    ? "Solo las zonas de entidades especiales se pueden dar de baja"
                    : undefined
                }
                className="flex items-center gap-1.5"
              >
                <Trash2 className="size-3.5" />
                {isDeleting ? "Eliminando..." : "Eliminar zona"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar zona geográfica?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará la zona{" "}
                  <strong>{zona?.nombre}</strong> del catálogo de riesgos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onEliminar}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirmar eliminación
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {soloNivelRiesgo && (
        <p className={hint}>
          Esta zona no es de entidades especiales: sus datos son de catalogo y
          solo puede ajustarse su nivel de riesgo.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombre" className={label}>
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={form.nombre}
            disabled={soloNivelRiesgo}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nombre: event.target.value }))
            }
            className={field}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="nivelRiesgo" className={label}>
            Nivel de riesgo
          </label>
          <NivelRiesgoSelect
            id="nivelRiesgo"
            required
            value={form.nivelRiesgoId}
            onChange={(id) => setForm((prev) => ({ ...prev, nivelRiesgoId: id }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="esEntidadEspecial" className={label}>
            Tipo de zona
          </label>
          <label className="flex items-center gap-2 py-2 text-sm text-foreground">
            <input
              id="esEntidadEspecial"
              type="checkbox"
              checked={form.esEntidadEspecial}
              disabled={soloNivelRiesgo}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, esEntidadEspecial: event.target.checked }))
              }
              className="size-4 rounded border-border accent-accent"
            />
            Zona de entidades especiales
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="estatus" className={label}>
            Estatus
          </label>
          <select
            id="estatus"
            value={form.estatus}
            disabled={soloNivelRiesgo}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, estatus: event.target.value as EstatusZona }))
            }
            className={field}
          >
            <option value="A">Activa</option>
            <option value="INA">Inactiva</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || isDeleting}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
