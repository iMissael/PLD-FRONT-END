import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { PuntajeFactor } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import {
  claveSubfactor,
  etiquetaFactor,
  etiquetaSubfactor,
  type DetallesSubfactor,
} from "@/features/operacion/evaluacion-riesgo/utils/detalleSubfactor";
import {
  nivelDesdePromedio,
  nivelPorValorEntero,
  type NivelRiesgoInfo,
} from "@/features/operacion/evaluacion-riesgo/utils/nivelRiesgo";

/**
 * Tabla "Matriz de Factores y Ponderación de Riesgo": usada tanto en la evaluación
 * en vivo (con el detalle capturado por subfactor) como en el historial (sin él,
 * ya que ese texto no se persiste — solo el desglose numérico).
 */

export const COLUMNAS_DESGLOSE = "md:grid-cols-[minmax(0,1fr)_92px_92px_92px_100px]";

function numero(valor: number | undefined, decimales = 2) {
  return valor === undefined ? "—" : valor.toFixed(decimales);
}

function etiquetaDeNivel(nivel: NivelRiesgoInfo | undefined) {
  return nivel ? nivel.label.replace(" ", "_").toUpperCase() : "—";
}

export function NivelBadge({
  nivel,
  tamano = "fila",
}: {
  nivel: NivelRiesgoInfo | undefined;
  tamano?: "fila" | "factor";
}) {
  if (!nivel) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border font-bold",
        tamano === "fila" ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        nivel.suave,
      )}
    >
      {etiquetaDeNivel(nivel)}
    </span>
  );
}

function FilaSubfactor({
  descripcion,
  valor,
  ponderacion,
  puntaje,
  detalle,
  mostrarDetalle,
}: {
  descripcion: string | undefined;
  valor: number | undefined;
  ponderacion: number | undefined;
  puntaje: number | undefined;
  detalle: string | undefined;
  mostrarDetalle: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-1 px-4 py-2.5 transition hover:bg-muted/50 md:items-center",
        COLUMNAS_DESGLOSE,
      )}
    >
      <div className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">
          {etiquetaSubfactor(descripcion)}
        </span>
        {mostrarDetalle && (
          <span
            className={cn(
              "block truncate text-[11px]",
              detalle ? "text-muted-foreground" : "font-medium text-amber-600 dark:text-amber-400",
            )}
          >
            {detalle ?? "Dato no capturado / encontrado"}
          </span>
        )}
      </div>
      <div className="font-semibold text-foreground md:text-center">{numero(valor, 1)}</div>
      <div className="font-mono text-muted-foreground md:text-center">
        {numero(ponderacion, 2)}%
      </div>
      <div className="md:text-center">
        <NivelBadge nivel={nivelPorValorEntero(valor)} />
      </div>
      <div className="font-mono font-bold text-foreground md:text-right">
        {numero(puntaje, 2)}
      </div>
    </div>
  );
}

export function TarjetaFactor({
  factor,
  indice,
  detalles,
}: {
  factor: PuntajeFactor;
  indice: number;
  /** Omitido (no `{}`) en el historial: ese texto capturado no se persiste por evaluación. */
  detalles?: DetallesSubfactor;
}) {
  const esEnfoque = claveSubfactor(factor.descripcionFactor).includes("enfoque");
  const [abierto, setAbierto] = useState(!esEnfoque);
  const nivel = nivelDesdePromedio(factor.puntajeObtenido);
  const colorPunto = nivel?.solido.split(" ")[0] ?? "bg-muted-foreground/40";
  const ChevronFactor = abierto ? ChevronUp : ChevronDown;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs",
        esEnfoque && "border-primary/40 bg-primary/5",
      )}
    >
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className={cn(
          "flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-muted/50",
          abierto && "border-b border-border bg-muted/30",
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <ChevronFactor className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn("size-2 shrink-0 rounded-full", colorPunto)} />
          <span className="truncate text-sm font-bold text-foreground">
            {indice + 1}. {etiquetaFactor(factor.descripcionFactor)}
          </span>
        </span>
        <span className="flex items-center gap-5 text-xs">
          <span className="text-muted-foreground">
            <b className="font-semibold text-foreground">Valor:</b>{" "}
            {numero(factor.puntajeObtenido, 2)}
          </span>
          <span className="text-muted-foreground">
            <b className="font-semibold text-foreground">Pond:</b>{" "}
            {numero(factor.pesoPorcentaje, 2)}%
          </span>
          <NivelBadge nivel={nivel} tamano="factor" />
          <span className="rounded bg-muted px-2 py-1 font-mono font-bold text-foreground">
            {numero(factor.scorePonderado ?? factor.puntajeObtenido, 2)}
          </span>
        </span>
      </button>

      {abierto && (
        <div className="divide-y divide-border bg-card text-xs">
          {factor.subfactores?.map((sub, i) => (
            <FilaSubfactor
              key={`${sub.descripcion}-${i}`}
              descripcion={sub.descripcion}
              valor={sub.valor}
              ponderacion={sub.ponderacion}
              puntaje={sub.puntaje}
              detalle={detalles?.[claveSubfactor(sub.descripcion)]}
              mostrarDetalle={detalles !== undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Encabezado de columnas de la matriz (oculto en móvil, igual que las filas). */
export function EncabezadoDesglose() {
  return (
    <div
      className={cn(
        "hidden gap-2 rounded-lg border border-border bg-muted/60 px-4 py-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase md:grid",
        COLUMNAS_DESGLOSE,
      )}
    >
      <span>Criterio / Factor evaluado</span>
      <span className="text-center">Valor / Calificación</span>
      <span className="text-center">Ponderación</span>
      <span className="text-center">Nivel riesgo</span>
      <span className="text-right">Valor ponderado</span>
    </div>
  );
}
