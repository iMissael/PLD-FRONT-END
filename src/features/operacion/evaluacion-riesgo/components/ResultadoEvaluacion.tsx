import { ChevronDown } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/utils/cn";
import type {
  EvaluacionRiesgoResultado,
  PuntajeFactor,
} from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import {
  nivelDesdePromedio,
  nivelPorValorEntero,
  type NivelRiesgoInfo,
} from "@/features/operacion/evaluacion-riesgo/utils/nivelRiesgo";

type Nivel = NivelRiesgoInfo;

function numero(valor: number | undefined, decimales = 2) {
  return valor === undefined ? "—" : valor.toFixed(decimales);
}

function NivelBadge({
  nivel,
  etiqueta,
  tono = "suave",
}: {
  nivel: Nivel | undefined;
  etiqueta?: string;
  tono?: "suave" | "solido";
}) {
  if (!nivel)
    return <span className="text-muted-foreground text-xs">Sin determinar</span>;
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        tono === "solido" ? `${nivel.solido} border-transparent` : nivel.suave,
      )}
    >
      {etiqueta ?? nivel.label}
    </Badge>
  );
}

function FactorDesglose({ factor }: { factor: PuntajeFactor }) {
  const nivelFactor = nivelDesdePromedio(factor.puntajeObtenido);

  return (
    <Collapsible defaultOpen className="rounded-lg border">
      <CollapsibleTrigger className="group hover:bg-muted/40 flex w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left transition-colors">
        <div className="flex min-w-0 items-center gap-3">
          <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=closed]:-rotate-90" />
          <span className="truncate font-medium">{factor.descripcionFactor}</span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <span className="text-muted-foreground text-sm">
            Peso {numero(factor.pesoPorcentaje, 0)}%
          </span>
          <NivelBadge nivel={nivelFactor} />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-2 border-t px-4 pt-2 pb-4">
          {factor.subfactores && factor.subfactores.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub-criterio</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ponderación</TableHead>
                  <TableHead>Riesgo</TableHead>
                  <TableHead className="text-right">Valor ponderado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {factor.subfactores.map((sub, index) => (
                  <TableRow key={`${sub.descripcion}-${index}`}>
                    <TableCell className="text-muted-foreground">
                      {sub.descripcion}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {numero(sub.valor, 1)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {numero(sub.ponderacion, 0)}%
                    </TableCell>
                    <TableCell>
                      <NivelBadge nivel={nivelPorValorEntero(sub.valor)} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {numero(sub.puntaje, 4)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-end gap-3 border-t pt-3 text-sm">
            <span className="text-muted-foreground">Valor total</span>
            <span className="font-semibold tabular-nums">
              {numero(factor.puntajeObtenido, 2)}
            </span>
            <span className="text-muted-foreground">Riesgo determinado</span>
            <NivelBadge nivel={nivelFactor} tono="solido" />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ResultadoEvaluacion({
  resultado,
}: {
  resultado: EvaluacionRiesgoResultado;
}) {
  const nivelGeneral = nivelPorValorEntero(resultado.nivel_riesgo?.valor);
  const etiquetaGeneral = resultado.nivel_riesgo?.descripcion?.replaceAll("_", " ");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Puntuación total</p>
          <p className="text-primary text-4xl font-semibold tabular-nums">
            {numero(resultado.puntuacion_total)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-sm">Nivel de riesgo</p>
          <div className="mt-1">
            <NivelBadge nivel={nivelGeneral} etiqueta={etiquetaGeneral} tono="solido" />
          </div>
        </div>
        {resultado.id_evaluacion !== undefined && (
          <div className="text-right">
            <p className="text-muted-foreground text-sm">ID de evaluación</p>
            <p className="font-medium">#{resultado.id_evaluacion}</p>
          </div>
        )}
      </div>

      {resultado.motivo && (
        <p className="text-muted-foreground text-sm">{resultado.motivo}</p>
      )}

      {resultado.desglose?.factores && resultado.desglose.factores.length > 0 && (
        <div className="space-y-3">
          {resultado.desglose.factores.map((factor, index) => (
            <FactorDesglose
              key={`${factor.descripcionFactor}-${index}`}
              factor={factor}
            />
          ))}

          <div className="bg-muted/40 flex flex-wrap items-center justify-end gap-3 rounded-lg border px-4 py-3">
            <span className="text-sm font-medium">Puntuación total</span>
            <span className="font-semibold tabular-nums">
              {numero(resultado.puntuacion_total)}
            </span>
            <span className="text-sm font-medium">Riesgo determinado</span>
            <NivelBadge nivel={nivelGeneral} etiqueta={etiquetaGeneral} tono="solido" />
          </div>
        </div>
      )}
    </div>
  );
}
