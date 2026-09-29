import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { InputFormateado } from "@/shared/components/InputFormateado";
import { alfanumerico, nombrePropio, rfc } from "@/shared/utils/entradas";
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

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusquedaBloqueadosFormValues>({
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
      className="border-border bg-card grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="text-foreground text-sm font-medium">
          Nombre
        </label>
        <Controller
          control={control}
          name="nombre"
          render={({ field }) => (
            <InputFormateado
              id="nombre"
              formato={nombrePropio}
              maxLength={200}
              className="border-input focus:border-ring text-foreground rounded-md border px-3 py-2 text-sm focus:outline-none"
              {...field}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="rfc" className="text-foreground text-sm font-medium">
          RFC
        </label>
        <Controller
          control={control}
          name="rfc"
          render={({ field }) => (
            <InputFormateado
              id="rfc"
              formato={rfc}
              maxLength={13}
              className="border-input focus:border-ring text-foreground rounded-md border px-3 py-2 text-sm focus:outline-none"
              {...field}
            />
          )}
        />
        {errors.rfc && <p className="text-destructive text-xs">{errors.rfc.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="curp" className="text-foreground text-sm font-medium">
          CURP
        </label>
        <Controller
          control={control}
          name="curp"
          render={({ field }) => (
            <InputFormateado
              id="curp"
              formato={alfanumerico}
              maxLength={18}
              className="border-input focus:border-ring text-foreground rounded-md border px-3 py-2 text-sm focus:outline-none"
              {...field}
            />
          )}
        />
        {errors.curp && <p className="text-destructive text-xs">{errors.curp.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fechaNacimiento" className="text-foreground text-sm font-medium">
          Fecha de nacimiento
        </label>
        <input
          id="fechaNacimiento"
          type="date"
          className="border-input focus:border-ring text-foreground rounded-md border px-3 py-2 text-sm focus:outline-none"
          {...register("fechaNacimiento")}
        />
      </div>

      <div className="col-span-full flex items-center justify-between gap-4">
        {formError ? <p className="text-destructive text-sm">{formError}</p> : <span />}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => reset(DEFAULT_VALUES)}
            className="border-input text-foreground hover:bg-secondary rounded-md border px-4 py-2 text-sm font-medium"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {isPending ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </div>
    </form>
  );
}
