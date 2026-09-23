import { useEffect, useState } from "react";

import { useZonaIdsDePais } from "../hooks/usePaises";
import type { ActualizarPaisInput, PaisResponse } from "../types/pais";
import { ZonasMultiSelect } from "./ZonasMultiSelect";

interface PaisFormProps {
  /** El catálogo de países es de solo edición: siempre se edita uno existente. */
  pais: PaisResponse;
  onGuardar: (input: ActualizarPaisInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  tipo: string;
  codigoIso: string;
  nombre: string;
  nacionalidad: string;
  zonaIds: string[];
}

function aFormState(pais: PaisResponse): FormState {
  return {
    tipo: pais.tipo ?? "",
    codigoIso: pais.codigoIso ?? "",
    nombre: pais.nombre,
    nacionalidad: pais.nacionalidad ?? "",
    zonaIds: pais.zonasAsignadas,
  };
}

export function PaisForm({ pais, onGuardar, onCancelar, isPending }: PaisFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(pais));
  const { data: zonaIdsReales } = useZonaIdsDePais(pais.idPais);

  useEffect(() => {
    setForm(aFormState(pais));
  }, [pais]);

  // En cuanto llegan los IDs reales de zona (endpoint dedicado), reemplazan
  // el valor inicial tomado de `zonasAsignadas`, que puede no ser confiable
  // como identificador según cómo lo arme el backend.
  useEffect(() => {
    if (zonaIdsReales) {
      setForm((prev) => ({ ...prev, zonaIds: zonaIdsReales }));
    }
  }, [zonaIdsReales]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onGuardar({
      tipo: form.tipo.trim(),
      codigoIso: form.codigoIso.trim().toUpperCase(),
      nombre: form.nombre.trim(),
      nacionalidad: form.nacionalidad.trim(),
      zonaIds: form.zonaIds,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h3 className="text-sm font-semibold text-slate-900">Editar país: {pais.nombre}</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombrePais" className="text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="nombrePais"
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
          <label htmlFor="nacionalidad" className="text-sm font-medium text-slate-700">
            Nacionalidad
          </label>
          <input
            id="nacionalidad"
            type="text"
            required
            value={form.nacionalidad}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nacionalidad: event.target.value }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="codigoIso" className="text-sm font-medium text-slate-700">
            Código ISO <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="codigoIso"
            type="text"
            maxLength={10}
            value={form.codigoIso}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, codigoIso: event.target.value }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm uppercase focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="tipo" className="text-sm font-medium text-slate-700">
            Tipo <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="tipo"
            type="text"
            maxLength={2}
            value={form.tipo}
            onChange={(event) => setForm((prev) => ({ ...prev, tipo: event.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Zonas asignadas</span>
          <ZonasMultiSelect
            value={form.zonaIds}
            onChange={(zonaIds) => setForm((prev) => ({ ...prev, zonaIds }))}
          />
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
