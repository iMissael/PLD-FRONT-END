import { useState } from "react";

import { CalendarioFecha } from "@/shared/components/ui/CalendarioFecha";
import { card, field, label } from "@/shared/components/ui/styles";
import { cn } from "@/shared/utils/cn";

import type { DatosFuenteInformacion } from "../utils/fuenteInformacion";

function CampoExpandible({
  id,
  titulo,
  valor,
  faltante,
  onCambiar,
}: {
  id: string;
  titulo: string;
  valor: string;
  faltante?: boolean;
  onCambiar: (valor: string) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  return (
    <div
      className={cn(card, "flex flex-col gap-2 p-3", faltante && "ring-warning ring-2")}
    >
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className={label}>
          {titulo}
        </label>
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="text-primary text-xs font-medium hover:underline"
        >
          {expandido ? "Mostrar menos" : "Mostrar más"}
        </button>
      </div>
      <textarea
        id={id}
        rows={expandido ? 8 : 3}
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        className={`${field} uppercase`}
      />
    </div>
  );
}

export function FuenteInformacionMoral({
  datos,
  fechaMaxima,
  faltantes,
  onCambiar,
}: {
  datos: DatosFuenteInformacion;
  fechaMaxima: string;
  faltantes?: Partial<Record<keyof DatosFuenteInformacion, boolean>>;
  onCambiar: (datos: DatosFuenteInformacion) => void;
}) {
  return (
    <fieldset className={cn(card, "flex flex-col gap-3 p-4")}>
      <legend className={`${label} px-1`}>Persona moral</legend>
      <div className="flex flex-col gap-1 sm:max-w-xs">
        <label htmlFor="fechaEmisionFuente" className={label}>
          Fecha de emisión de la fuente de información
        </label>
        <div
          className={cn(
            faltantes?.fechaEmisionFuente && "ring-warning rounded-md ring-2",
          )}
        >
          <CalendarioFecha
            id="fechaEmisionFuente"
            max={fechaMaxima}
            valor={datos.fechaEmisionFuente}
            onCambiar={(fecha) => onCambiar({ ...datos, fechaEmisionFuente: fecha })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CampoExpandible
          id="fuenteInformacion"
          titulo="Fuente de información"
          valor={datos.fuenteInformacion}
          faltante={faltantes?.fuenteInformacion}
          onCambiar={(v) => onCambiar({ ...datos, fuenteInformacion: v })}
        />
        <CampoExpandible
          id="estatusReportado"
          titulo="Estatus del reportado"
          valor={datos.estatusReportado}
          faltante={faltantes?.estatusReportado}
          onCambiar={(v) => onCambiar({ ...datos, estatusReportado: v })}
        />
      </div>
    </fieldset>
  );
}
