import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, label } from "@/shared/components/ui/styles";
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
  /** null = nueva zona especial. */
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
  estatus: EstatusZona;
}

function aFormState(zona: ZonaGeograficaResponse | null): FormState {
  return zona
    ? { nombre: zona.nombre, nivelRiesgoId: zona.nivelRiesgoId ?? "", estatus: zona.estatus }
    : { nombre: "", nivelRiesgoId: "", estatus: "A" };
}

/**
 * Las zonas principales (ZONA 1, 2 y 3 - NACIONAL) son fijas: solo se edita su
 * nivel de riesgo. Lo que se crea son zonas especiales (p. ej. ZONA
 * FRONTERIZA), que no tienen nivel: cada entidad conserva el de su zona
 * principal. Las entidades se asignan desde la pantalla de Entidades.
 */
<<<<<<< HEAD
export function ZonaForm({ zona, onGuardar, onCancelar, isPending }: ZonaFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(zona));
=======
export function ZonaForm({
  zona,
  defaultTipo = "P",
  onGuardar,
  onCancelar,
  onEliminar,
  isPending,
  isDeleting,
}: ZonaFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(zona, defaultTipo));
>>>>>>> origin/develop

  useEffect(() => {
    setForm(aFormState(zona));
  }, [zona]);

  const esPrincipal = zona !== null && !zona.esEntidadEspecial;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (esPrincipal && form.nivelRiesgoId === "") return;
    onGuardar({
      nombre: form.nombre.trim(),
      esEntidadEspecial: !esPrincipal,
      idNivelRiesgo: esPrincipal && form.nivelRiesgoId !== "" ? form.nivelRiesgoId : null,
      estatus: esPrincipal ? "A" : form.estatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
<<<<<<< HEAD
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {zona === null
            ? "Nueva zona especial"
            : esPrincipal
              ? `Zona principal: ${zona.nombre}`
              : `Editar zona especial: ${zona.nombre}`}
        </h3>
        <p className="text-xs text-muted-foreground">
          {esPrincipal
            ? "Las zonas principales son fijas: solo se puede cambiar su nivel de riesgo."
            : "Una zona especial no tiene nivel: cada entidad conserva el de su zona principal."}
        </p>
=======
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {esNueva ? "Nueva zona geográfica" : `Editar zona: ${zona.nombre}`}
        </h3>

        {!esNueva && onEliminar && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variante="peligro"
                size="sm"
                disabled={isDeleting || isPending}
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
>>>>>>> origin/develop
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {esPrincipal ? (
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
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="nombre" className={label}>
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={form.nombre}
                onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
                className={field}
              />
            </div>

<<<<<<< HEAD
            <div className="flex flex-col gap-1">
              <label htmlFor="estatus" className={label}>
                Estatus
              </label>
              <select
                id="estatus"
                value={form.estatus}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, estatus: event.target.value as EstatusZona }))
                }
                className={field}
              >
                <option value="A">Activa</option>
                <option value="B">Inactiva</option>
              </select>
            </div>
          </>
        )}
=======
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
          <label htmlFor="estatus" className={label}>
            Estatus
          </label>
          <select
            id="estatus"
            value={form.estatus}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, estatus: event.target.value as EstatusZona }))
            }
            className={field}
          >
            <option value="A">Activa</option>
            <option value="INA">Inactiva</option>
          </select>
        </div>
>>>>>>> origin/develop
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
