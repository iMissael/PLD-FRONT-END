import { Calendar, ChevronDown, Clipboard, Copy, User } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";
import { BuscadorSocios } from "@/features/operacion/evaluacion-riesgo/components/BuscadorSocios";
import type { ClienteMatrizRiesgo } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import type { SocioExterno } from "@/features/socios/types/socios";

function copiar(texto: string) {
  navigator.clipboard?.writeText(texto).catch(() => {});
}

function CampoCopiable({
  etiqueta,
  valor,
  mono = false,
  icono: Icono = Copy,
}: {
  etiqueta: string;
  valor: string;
  mono?: boolean;
  icono?: typeof Copy;
}) {
  return (
    <div className="space-y-1">
      <p
        className={cn(
          "text-gray-500",
          mono
            ? "text-[11px] font-semibold tracking-wider uppercase"
            : "text-[11px] font-medium",
        )}
      >
        {etiqueta}
      </p>
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <span
          className={cn(
            "truncate text-foreground",
            mono ? "font-mono font-bold tracking-wider" : "font-bold",
          )}
        >
          {valor}
        </span>
        <button
          type="button"
          onClick={() => copiar(valor)}
          className="shrink-0 text-muted-foreground transition hover:text-primary"
          aria-label={`Copiar ${etiqueta}`}
        >
          <Icono className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ExpedienteDelCliente({ cliente }: { cliente: ClienteMatrizRiesgo }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Nombre del titular
        </p>
        <div className="rounded-lg border border-border bg-muted/40 p-2.5 font-bold tracking-wide text-foreground uppercase">
          {cliente.nombre}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CampoCopiable etiqueta="No. Cliente" valor={cliente.numero} />
        <CampoCopiable etiqueta="Referencia" valor={cliente.referencia} mono />
      </div>

      <CampoCopiable etiqueta="R.F.C." valor={cliente.rfc} mono icono={Clipboard} />
      <CampoCopiable etiqueta="C.U.R.P." valor={cliente.curp} mono icono={Clipboard} />

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Tipo de persona
        </p>
        <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-muted/40 p-1">
          {(["FISICA", "MORAL"] as const).map((tipo) => {
            const activo = cliente.persona === tipo;
            return (
              <div
                key={tipo}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs",
                  activo
                    ? "border border-border bg-card font-semibold text-primary shadow-xs"
                    : "font-medium text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    activo ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                />
                {tipo === "FISICA" ? "Física" : "Moral"}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Tipo de cliente
        </p>
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 font-medium text-foreground uppercase">
          <span className="truncate">{cliente.tipoCliente}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-[11px]">
        <div>
          <p className="font-medium text-muted-foreground">Fecha de Alta</p>
          <p className="mt-0.5 flex items-center gap-1 font-semibold text-foreground">
            <Calendar className="size-3.5 text-muted-foreground" />
            {cliente.fechaAlta}
          </p>
        </div>
        <div>
          <p className="font-medium text-muted-foreground">Sucursal</p>
          <p className="mt-0.5 font-bold tracking-wide text-foreground uppercase">
            {cliente.sucursal}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-2.5 text-[10px] text-muted-foreground">
        <span>Última modificación:</span>
        <span className="font-mono font-semibold text-foreground">
          {cliente.fechaModificacion}
        </span>
      </div>
    </div>
  );
}

/**
 * Panel "Expediente del Cliente" (header + buscador + datos), tal como en la Matriz de Riesgo
 * Integral — reutilizado también en el Historial de evaluaciones para mantener el mismo formato.
 */
export function ExpedienteClienteAside({
  titulo = "Expediente del Cliente",
  cliente,
  cargando,
  error,
  valorBuscador,
  onSeleccionarSocio,
}: {
  titulo?: string;
  cliente: ClienteMatrizRiesgo | null;
  cargando: boolean;
  error: boolean;
  valorBuscador: string;
  onSeleccionarSocio: (socio: SocioExterno) => void;
}) {
  return (
    <aside className="w-full shrink-0 overflow-y-auto border-b border-border bg-card lg:w-[300px] lg:rounded-bl-lg lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-white">
        <span className="flex items-center gap-2 text-sm font-semibold tracking-wide">
          <span className="rounded bg-indigo-500/20 p-1 text-indigo-300">
            <User className="size-4" />
          </span>
          {titulo}
        </span>
        {cliente && (
          <span className="rounded border border-green-500/30 bg-green-500/20 px-2 py-0.5 text-[11px] font-semibold text-green-300">
            Activo
          </span>
        )}
      </div>

      <div className="space-y-4 p-4 text-xs">
        <div className="space-y-2 rounded-xl border border-gray-200 bg-slate-50 p-3 dark:border-border dark:bg-slate-900/60">
          <p className="text-[11px] font-semibold tracking-wider text-gray-500 dark:text-muted-foreground uppercase">
            Referencia / No. Cliente / Nombre
          </p>
          <BuscadorSocios
            variante="panel"
            valor={valorBuscador}
            placeholder="Elige un socio…"
            onSeleccionar={onSeleccionarSocio}
          />
        </div>

        {cargando && (
          <div className="space-y-3" aria-label="Cargando expediente">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!cargando && error && (
          <p className="text-sm text-red-600">No se encontraron datos de este socio.</p>
        )}
        {!cargando && !error && cliente && <ExpedienteDelCliente cliente={cliente} />}
        {!cargando && !error && !cliente && (
          <p className="text-muted-foreground text-sm">
            Usa la lupa para ver los socios del sistema.
          </p>
        )}
      </div>
    </aside>
  );
}
