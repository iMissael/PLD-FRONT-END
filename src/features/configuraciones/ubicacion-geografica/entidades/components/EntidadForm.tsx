import { useEffect, useState } from "react";

import { useMexicoPaisId } from "../hooks/useMexicoPaisId";
import type { CrearEntidadInput, EsEntidad, EntidadResponse } from "../types/entidad";
import { ZonaSelect } from "./ZonaSelect";

interface EntidadFormProps {
  entidad: EntidadResponse | null;
  onGuardar: (input: CrearEntidadInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  claveCurp: string;
  nombre: string;
  preBuro: string;
  esEntidad: EsEntidad;
  zonaId: string;
}

const VACIO: FormState = {
  claveCurp: "",
  nombre: "",
  preBuro: "",
  esEntidad: "N",
  zonaId: "",
};

/**
 * Sin selector de país: todas las entidades de este catálogo son de México,
 * así que `paisId` se resuelve automáticamente (ver `useMexicoPaisId`) y no
 * se le pide nada al usuario al respecto.
 */
export function EntidadForm({
  entidad,
  onGuardar,
  onCancelar,
  isPending,
}: EntidadFormProps) {
  const [form, setForm] = useState<FormState>(VACIO);
  const { paisId: mexicoPaisId, isLoading: cargandoPais } = useMexicoPaisId();

  useEffect(() => {
    setForm(
      entidad
        ? {
            claveCurp: entidad.claveCurp,
            nombre: entidad.nombre,
            preBuro: entidad.preBuro ?? "",
            esEntidad: entidad.esEntidad ?? "N",
            zonaId: entidad.idZona,
          }
        : VACIO,
    );
  }, [entidad]);

  const esNueva = entidad === null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!mexicoPaisId || !form.zonaId) return;
    onGuardar({
      claveCurp: form.claveCurp.trim(),
      nombre: form.nombre.trim(),
      preBuro: form.preBuro.trim(),
      esEntidad: form.esEntidad,
      paisId: mexicoPaisId,
      zonaId: form.zonaId,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h3 className="text-sm font-semibold text-slate-900">
        {esNueva ? "Nueva entidad" : `Editar entidad: ${entidad.nombre}`}
      </h3>

      {!cargandoPais && !mexicoPaisId ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No se encontró "México" en el catálogo de países. Registra ese país antes de
          crear entidades.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="claveCurp" className="text-sm font-medium text-slate-700">
            Clave CURP
          </label>
          <input
            id="claveCurp"
            type="text"
            required
            maxLength={100}
            value={form.claveCurp}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, claveCurp: event.target.value }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="nombreEntidad" className="text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="nombreEntidad"
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
          <label htmlFor="preBuro" className="text-sm font-medium text-slate-700">
            Pre-buró <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="preBuro"
            type="text"
            maxLength={4}
            value={form.preBuro}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, preBuro: event.target.value }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm uppercase focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="esEntidad" className="text-sm font-medium text-slate-700">
            ¿Es entidad federativa?
          </label>
          <select
            id="esEntidad"
            value={form.esEntidad}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, esEntidad: event.target.value as EsEntidad }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="S">Sí</option>
            <option value="N">No</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="zonaEntidad" className="text-sm font-medium text-slate-700">
            Zona geográfica
          </label>
          <ZonaSelect
            id="zonaEntidad"
            required
            value={form.zonaId}
            onChange={(zonaId) => setForm((prev) => ({ ...prev, zonaId }))}
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
          disabled={isPending || !mexicoPaisId}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
