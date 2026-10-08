import { useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, label } from "@/shared/components/ui/styles";

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
      className={`flex flex-col gap-4 p-4 ${card}`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="fecha-inicial" className={label}>
            Fecha inicial
          </label>
          <input
            id="fecha-inicial"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className={field}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fecha-final" className={label}>
            Fecha final
          </label>
          <input
            id="fecha-final"
            type="date"
            min={desde || undefined}
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className={field}
          />
        </div>
      </div>
      <fieldset className="flex flex-wrap items-center justify-center gap-6">
        <legend className="sr-only">Estatus asignado</legend>
        {ESTATUS_AUTORIZACION.map((opcion) => (
          <label key={opcion.valor} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={estatus.includes(opcion.valor)}
              onChange={() => alternar(opcion.valor)}
              className="accent-primary"
            />
            {opcion.etiqueta}
          </label>
        ))}
      </fieldset>
      <div className="flex justify-center">
        <Button type="submit">Consultar</Button>
      </div>
    </form>
  );
}
