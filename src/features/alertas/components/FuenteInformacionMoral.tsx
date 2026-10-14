import { useState } from "react";

import { CalendarioFecha } from "@/shared/components/molecules/CalendarioFecha";
import { Card } from "@/shared/components/molecules";
import { label } from "@/shared/styles/tokens";
import { cn } from "@/shared/utils/cn";

import type { DatosFuenteInformacion } from "../utils/fuenteInformacion";

const textareaStyle =
  "border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border p-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed";

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
    <Card
      className={cn("flex flex-col gap-2 p-3", faltante && "ring-warning ring-2")}
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
        className={`${textareaStyle} uppercase`}
      />
    </Card>
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
    <fieldset className="border-border bg-card text-card-foreground rounded-xl border p-4 shadow-sm flex flex-col gap-3">
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
