import { useState } from "react";
import { PlusIcon, XIcon } from "@/shared/components/atoms/icons";
import { Button } from "@/shared/components/atoms/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/atoms/Table";
import type { Moneda } from "../types/reglaAlerta";

export type PermisoMoneda = "PERMITIDO" | "NO_PERMITIDO";

export const PERMISOS: { valor: PermisoMoneda; etiqueta: string }[] = [
  { valor: "PERMITIDO", etiqueta: "Permitido" },
  { valor: "NO_PERMITIDO", etiqueta: "No permitido" },
];

export const MONEDAS: Moneda[] = ["MXN", "USD"];

export interface MonedaConfigurada {
  permiso: PermisoMoneda;
  moneda: Moneda;
}

interface ReglaMonedasSectionProps {
  monedas: MonedaConfigurada[];
  onChange: (monedas: MonedaConfigurada[]) => void;
  disabled?: boolean;
}

export function ReglaMonedasSection({
  monedas,
  onChange,
  disabled = false,
}: ReglaMonedasSectionProps) {
  const [permisoMoneda, setPermisoMoneda] = useState<PermisoMoneda | "">("");
  const [monedaPorAgregar, setMonedaPorAgregar] = useState<Moneda | "">("");

  const agregarMoneda = () => {
    if (permisoMoneda === "" || monedaPorAgregar === "") return;
    const yaExiste = monedas.some((m) => m.moneda === monedaPorAgregar);
    const nuevas = yaExiste
      ? monedas.map((m) =>
          m.moneda === monedaPorAgregar ? { ...m, permiso: permisoMoneda } : m,
        )
      : [...monedas, { permiso: permisoMoneda, moneda: monedaPorAgregar }];
    onChange(nuevas);
  };

  const quitarMoneda = (moneda: Moneda) => {
    onChange(monedas.filter((m) => m.moneda !== moneda));
  };

  return (
    <section className="border-border flex flex-col gap-3 border-t pt-4">
      <h4 className="text-foreground text-center text-sm font-semibold">
        Configuración de monedas
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="permisoMoneda" className="text-foreground text-xs font-semibold">
              Permiso moneda
            </label>
            <select
              id="permisoMoneda"
              value={permisoMoneda}
              onChange={(e) => setPermisoMoneda(e.target.value as PermisoMoneda | "")}
              disabled={disabled}
              className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
            >
              <option value="">Seleccione</option>
              {PERMISOS.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.etiqueta}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="monedaPorAgregar" className="text-foreground text-xs font-semibold">
              Moneda
            </label>
            <select
              id="monedaPorAgregar"
              value={monedaPorAgregar}
              onChange={(e) => setMonedaPorAgregar(e.target.value as Moneda | "")}
              disabled={disabled}
              className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
            >
              <option value="">Seleccione</option>
              {MONEDAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button
              className="px-3"
              aria-label="Agregar moneda"
              title="Agregar moneda"
              onClick={agregarMoneda}
              disabled={disabled || permisoMoneda === "" || monedaPorAgregar === ""}
            >
              <PlusIcon className="size-4" />
            </Button>
            <Button
              variante="secundario"
              onClick={() => onChange([])}
              disabled={disabled || monedas.length === 0}
            >
              Limpiar configuración de monedas
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border self-start">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Permiso</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monedas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-4">
                    Sin monedas configuradas (aplica a cualquier moneda).
                  </TableCell>
                </TableRow>
              ) : (
                monedas.map((m, idx) => (
                  <TableRow key={m.moneda}>
                    <TableCell className="text-xs">{idx + 1}</TableCell>
                    <TableCell className="text-xs">
                      <span
                        className={
                          m.permiso === "PERMITIDO"
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-amber-600 dark:text-amber-400 font-medium"
                        }
                      >
                        {m.permiso === "PERMITIDO" ? "Permitido" : "No permitido"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{m.moneda}</TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        aria-label={`Quitar ${m.moneda}`}
                        onClick={() => quitarMoneda(m.moneda)}
                        disabled={disabled}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-6 items-center justify-center rounded-md p-1 transition-colors cursor-pointer"
                      >
                        <XIcon className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
