import type { ReactNode } from "react";

export type StatusType =
  | "activo"
  | "inactivo"
  | "neutro"
  | "A"
  | "INA"
  | "I"
  | "R"
  | "V"
  | "D"
  | "B"
  | "S"
  | "E"
  | (string & {});

const STATUS_STYLES: Record<string, string> = {
  // Catálogos (A / INA / activo / inactivo)
  activo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
  inactivo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
  neutro: "bg-primary/10 text-primary border-primary/20",
  A: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
  INA: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
  I: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",

  // Denuncias (R: Recepción, V: Verificación, A: Atendida, D: Desechada)
  R: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  V: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800",
  D: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",

  // Alertas PLD (A: Activa, B: Bloqueada, S: Suspendida, E: Evaluada)
  B: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800",
  S: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  E: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
};

interface StatusBadgeProps {
  status?: StatusType;
  tono?: "activo" | "inactivo" | "neutro";
  children?: ReactNode;
  label?: string;
  className?: string;
}

/**
 * Componente unificado de Badge de Estatus para toda la aplicación.
 */
export function StatusBadge({
  status,
  tono,
  children,
  label,
  className = "",
}: StatusBadgeProps) {
  const key = (tono ?? status ?? "neutro") as string;
  const styleClass =
    STATUS_STYLES[key] ??
    STATUS_STYLES[key.toLowerCase()] ??
    STATUS_STYLES.neutro;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${styleClass} ${className}`.trim()}
    >
      {children ?? label ?? key}
    </span>
  );
}
