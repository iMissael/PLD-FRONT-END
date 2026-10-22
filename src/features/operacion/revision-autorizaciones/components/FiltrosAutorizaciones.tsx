import { useState } from "react";
import { Button } from "@/shared/components/atoms/Button";
import { FormFieldGroup } from "@/shared/components/molecules/FormFieldGroup";
import { CalendarioFecha } from "@/shared/components/molecules/CalendarioFecha";
import { CasillaRedonda } from "@/shared/components/atoms/CasillaRedonda";
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
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <FormFieldGroup label="Fecha inicial" htmlFor="fecha-inicial">
            <CalendarioFecha
              id="fecha-inicial"
              valor={desde}
              max={hasta || undefined}
              onCambiar={setDesde}
              permitirBorrar
            />
          </FormFieldGroup>
        </div>

        <div className="flex-1 min-w-[200px]">
          <FormFieldGroup label="Fecha final" htmlFor="fecha-final">
            <CalendarioFecha
              id="fecha-final"
              valor={hasta}
              min={desde || undefined}
              onCambiar={setHasta}
              permitirBorrar
            />
          </FormFieldGroup>
        </div>

        <fieldset className="flex flex-wrap items-center gap-4 py-2">
          <legend className="sr-only">Estatus asignado</legend>
          {ESTATUS_AUTORIZACION.map((opcion) => (
            <CasillaRedonda
              key={opcion.valor}
              marcada={estatus.includes(opcion.valor)}
              onCambiar={() => alternar(opcion.valor)}
              className="text-xs sm:text-sm font-medium text-foreground"
            >
              {opcion.etiqueta}
            </CasillaRedonda>
          ))}
        </fieldset>

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
