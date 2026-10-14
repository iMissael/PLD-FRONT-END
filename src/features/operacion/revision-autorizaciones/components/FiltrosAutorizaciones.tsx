import { useState } from "react";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { FormFieldGroup } from "@/shared/components/molecules/FormFieldGroup";
import { Search } from "lucide-react";

import {
  ESTATUS_AUTORIZACION,
  type EstatusAutorizacion,
  type FiltroAutorizaciones,
} from "../types/autorizaciones";

interface FiltrosAutorizacionesProps {
  onConsultar: (filtro: FiltroAutorizaciones) => void;
}

export function FiltrosAutorizaciones({ onConsultar }: FiltrosAutorizacionesProps) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [estatus, setEstatus] = useState<EstatusAutorizacion[]>([]);

  const alternar = (valor: EstatusAutorizacion) =>
    setEstatus((prev) =>
      prev.includes(valor) ? prev.filter((e) => e !== valor) : [...prev, valor],
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConsultar({ desde: desde || undefined, hasta: hasta || undefined, estatus });
      }}
      className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4"
    >
      {/* Contenedor adaptativo con flex-wrap para fechas */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <FormFieldGroup label="Fecha inicial" htmlFor="fecha-inicial">
            <Input
              id="fecha-inicial"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </FormFieldGroup>
        </div>

        <div className="flex-1 min-w-[200px]">
          <FormFieldGroup label="Fecha final" htmlFor="fecha-final">
            <Input
              id="fecha-final"
              type="date"
              min={desde || undefined}
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </FormFieldGroup>
        </div>

        {/* Checkboxes de estatus asignado */}
        <fieldset className="flex flex-wrap items-center gap-4 py-2">
          <legend className="sr-only">Estatus asignado</legend>
          {ESTATUS_AUTORIZACION.map((opcion) => (
            <label
              key={opcion.valor}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={estatus.includes(opcion.valor)}
                onChange={() => alternar(opcion.valor)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30 accent-primary cursor-pointer"
              />
              {opcion.etiqueta}
            </label>
          ))}
        </fieldset>

        {/* Botón de consulta */}
        <div className="shrink-0">
          <Button type="submit" variant="default" className="gap-2">
            <Search className="h-4 w-4" />
            Consultar
          </Button>
        </div>
      </div>
    </form>
  );
}
