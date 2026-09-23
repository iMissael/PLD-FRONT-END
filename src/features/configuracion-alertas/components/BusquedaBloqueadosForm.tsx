import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  busquedaBloqueadosSchema,
  tieneAlMenosUnCriterio,
  type BusquedaBloqueadosFormValues,
} from "../types/busquedaBloqueadosSchema";
import type { ConsultaBloqueadosParams } from "../types/personaBloqueada";

interface BusquedaBloqueadosFormProps {
  onBuscar: (filtros: ConsultaBloqueadosParams) => void;
  isPending?: boolean;
}

const DEFAULT_VALUES: BusquedaBloqueadosFormValues = {
  nombre: "",
  rfc: "",
  curp: "",
  fechaNacimiento: "",
};

export function BusquedaBloqueadosForm({
  onBuscar,
  isPending,
}: BusquedaBloqueadosFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<BusquedaBloqueadosFormValues>({
    resolver: zodResolver(busquedaBloqueadosSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = handleSubmit((values) => {
    if (!tieneAlMenosUnCriterio(values)) {
      setFormError("Ingresa al menos un criterio de búsqueda.");
      return;
    }
    setFormError(null);

    // Los campos vacíos no se envían: así el back solo recibe los
    // criterios que realmente se llenaron.
    const filtros: ConsultaBloqueadosParams = Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => typeof value === "string" && value.length > 0,
      ),
    );
    onBuscar(filtros);
  });

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="text-sm font-medium text-slate-700">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          {...register("nombre")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="rfc" className="text-sm font-medium text-slate-700">
          RFC
        </label>
        <input
          id="rfc"
          type="text"
          maxLength={13}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm uppercase focus:border-slate-500 focus:outline-none"
          {...register("rfc")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="curp" className="text-sm font-medium text-slate-700">
          CURP
        </label>
        <input
          id="curp"
          type="text"
          maxLength={18}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm uppercase focus:border-slate-500 focus:outline-none"
          {...register("curp")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fechaNacimiento" className="text-sm font-medium text-slate-700">
          Fecha de nacimiento
        </label>
        <input
          id="fechaNacimiento"
          type="date"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          {...register("fechaNacimiento")}
        />
      </div>

      <div className="col-span-full flex items-center justify-between gap-4">
        {formError ? <p className="text-sm text-red-600">{formError}</p> : <span />}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => reset(DEFAULT_VALUES)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {isPending ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </div>
    </form>
  );
}
