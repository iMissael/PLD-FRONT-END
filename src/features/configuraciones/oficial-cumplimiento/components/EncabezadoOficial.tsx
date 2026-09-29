import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type TonoEstado = "ok" | "aviso" | "error" | "neutro";

const TONOS_ESTADO: Record<TonoEstado, { punto: string; texto: string }> = {
  ok: { punto: "bg-success", texto: "text-success-hover" },
  aviso: { punto: "bg-warning", texto: "text-warning-hover" },
  error: { punto: "bg-destructive", texto: "text-destructive-hover" },
  neutro: { punto: "bg-slate-400", texto: "text-slate-600" },
};

export function EstadoOficial({
  etiqueta,
  tono,
}: {
  etiqueta: string;
  tono: TonoEstado;
}) {
  const estilos = TONOS_ESTADO[tono];
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
    >
      <span className={cn("size-2.5 rounded-full", estilos.punto)} />
      <span className="font-medium text-slate-600">Estado:</span>
      <span className={cn("font-semibold tracking-wide uppercase", estilos.texto)}>
        {etiqueta}
      </span>
    </div>
  );
}

export function EncabezadoOficial({ estado }: { estado?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Oficial de cumplimiento</h1>
        <p className="text-muted-foreground">
          Datos de identificación, domicilio y parámetros PLD del oficial designado.
        </p>
      </div>
      {estado}
    </div>
  );
}

export function AvisoCumplimiento() {
  return (
    <div className="border-primary bg-primary-soft/60 flex items-start gap-3 rounded-r-lg border-l-4 p-4 shadow-sm">
      <Info className="text-primary mt-0.5 size-5 shrink-0" />
      <p className="flex-1 text-xs text-slate-700 sm:text-sm">
        <span className="font-bold text-slate-900">
          Cumplimiento regulatorio CNBV / SHCP:
        </span>{" "}
        verifica que los datos coincidan íntegramente con la identificación oficial
        vigente y con el comprobante de domicilio digitalizado.
      </p>
    </div>
  );
}
