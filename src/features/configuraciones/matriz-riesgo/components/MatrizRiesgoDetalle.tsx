import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "@/shared/components/atoms/StatusBadge";
import { BadgeSuma } from "@/shared/components/molecules/BadgeSuma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/atoms/Table";
import type { FactorRiesgo } from "@/features/configuraciones/matriz-riesgo/types/matrizRiesgo";

function esActivo(estatus: string | undefined) {
  return estatus === "A";
}

function sumaActivos(valores: { estatus?: string; valor: number }[]) {
  return valores.filter((v) => esActivo(v.estatus)).reduce((acc, v) => acc + v.valor, 0);
}


function FactorDetalleCard({
  factor,
  abiertoInicial = true,
}: {
  factor: FactorRiesgo;
  abiertoInicial?: boolean;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const subfactores = factor.subfactoresRef ?? [];
  const sumaSubfactores = sumaActivos(
    subfactores.map((s) => ({
      estatus: s.estatus,
      valor: s.ponderacion ?? 0,
    })),
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-2xs transition-shadow">
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 p-3.5 sm:p-4 text-left transition-colors hover:bg-muted/40 cursor-pointer"
        aria-expanded={abierto}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-semibold text-foreground text-sm sm:text-base">
            {factor.descripcion}
          </span>
          <StatusBadge tono={esActivo(factor.estatus) ? "activo" : "inactivo"}>
            {esActivo(factor.estatus) ? "Activo" : "Inactivo"}
          </StatusBadge>
          {subfactores.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({subfactores.length} subfactor{subfactores.length > 1 ? "es" : ""})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-sm font-bold text-foreground">
            {factor.peso}%
          </span>
          <div className="text-muted-foreground">
            {abierto ? (
              <ChevronUp className="size-4.5" />
            ) : (
              <ChevronDown className="size-4.5" />
            )}
          </div>
        </div>
      </button>

      {abierto && subfactores.length > 0 && (
        <div className="border-t border-border p-3.5 sm:p-4 space-y-3">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Subfactor</TableHead>
                  <TableHead className="w-1/4">Ponderación</TableHead>
                  <TableHead className="w-1/4">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subfactores.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-foreground">
                      {sub.descripcion}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {sub.ponderacion}%
                    </TableCell>
                    <TableCell>
                      <StatusBadge tono={esActivo(sub.estatus) ? "activo" : "inactivo"}>
                        {esActivo(sub.estatus) ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>Suma de ponderaciones de subfactores activos:</span>
            <BadgeSuma suma={sumaSubfactores} />
          </div>
        </div>
      )}
    </div>
  );
}

export function MatrizRiesgoDetalle({ factores }: { factores: FactorRiesgo[] }) {
  const sumaFactores = sumaActivos(
    factores.map((f) => ({ estatus: f.estatus, valor: f.peso ?? 0 })),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/30 px-3.5 py-2.5">
        <span className="text-sm font-medium text-foreground">
          Suma total de pesos de factores activos:
        </span>
        <BadgeSuma suma={sumaFactores} />
      </div>

      <div className="space-y-3">
        {factores.map((factor) => (
          <FactorDetalleCard key={factor.id} factor={factor} />
        ))}
      </div>
    </div>
  );
}
