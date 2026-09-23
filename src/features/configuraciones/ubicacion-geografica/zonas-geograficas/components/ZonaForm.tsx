import { useEffect, useState } from "react";

import { NivelRiesgoSelect } from "../../niveles-riesgo/components/NivelRiesgoSelect";
import type {
  CrearZonaGeograficaInput,
  EntidadPais,
  EstatusZona,
  ZonaGeograficaResponse,
} from "../types/zonaGeografica";

interface ZonaFormProps {
  zona: ZonaGeograficaResponse | null;
  onGuardar: (input: CrearZonaGeograficaInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  nombre: string;
  nivelRiesgoId: number | "";
  entidadPais: EntidadPais;
  estatus: EstatusZona;
}

const VACIO: FormState = {
  nombre: "",
  nivelRiesgoId: "",
  entidadPais: "P",
  estatus: "A",
};

function aFormState(zona: ZonaGeograficaResponse | null): FormState {
  if (!zona) return VACIO;
  return {
    nombre: zona.nombre,
    nivelRiesgoId: zona.nivelRiesgoId,
    entidadPais: zona.entidadPais ?? "P",
    estatus: zona.estatus,
  };
}

/**
 * Formulario de alta/edición de una zona geográfica. La asignación de
 * entidades/países vive aparte (ZonaAsignaciones), porque el backend la
 * expone como sub-recursos independientes (`PUT /{id}/entidades|paises`).
 */
export function ZonaForm({ zona, onGuardar, onCancelar, isPending }: ZonaFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(zona));

  useEffect(() => {
    setForm(aFormState(zona));
  }, [zona]);

  const esNueva = zona === null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.nivelRiesgoId === "") return;
    onGuardar({
      nombre: form.nombre.trim(),
      idNivelRiesgo: form.nivelRiesgoId,
      entidadPais: form.entidadPais,
      estatus: form.estatus,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h3 className="text-sm font-semibold text-slate-900">
        {esNueva ? "Nueva zona geográfica" : `Editar zona: ${zona.nombre}`}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombre" className="text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={form.nombre}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nombre: event.target.value }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="nivelRiesgo" className="text-sm font-medium text-slate-700">
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
          <label htmlFor="entidadPais" className="text-sm font-medium text-slate-700">
            Tipo de zona
          </label>
          <select
            id="entidadPais"
            value={form.entidadPais}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                entidadPais: event.target.value as EntidadPais,
              }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="P">Países</option>
            <option value="E">Entidades</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="estatus" className="text-sm font-medium text-slate-700">
            Estatus
          </label>
          <select
            id="estatus"
            value={form.estatus}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, estatus: event.target.value as EstatusZona }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="A">Activa</option>
            <option value="INA">Inactiva</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
