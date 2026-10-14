import * as React from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type AlertTono = "error" | "advertencia" | "exito" | "info";
export type AlertVariant = "destructive" | "warning" | "success" | "info" | "default";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tono?: AlertTono;
  variant?: AlertVariant;
  titulo?: string;
  mostrarIcono?: boolean;
}

const TONO_CONFIG: Record<
  AlertTono,
  { estilo: string; Icono: React.ComponentType<{ className?: string }> }
> = {
  error: {
    estilo: "border-destructive/30 bg-destructive-soft text-destructive",
    Icono: AlertCircle,
  },
  advertencia: {
    estilo: "border-warning/30 bg-warning-soft text-warning",
    Icono: AlertTriangle,
  },
  exito: {
    estilo: "border-success/30 bg-success-soft text-success-hover",
    Icono: CheckCircle,
  },
  info: {
    estilo: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    Icono: Info,
  },
};

export function Alert({
  tono,
  variant,
  titulo,
  mostrarIcono = false,
  className,
  children,
  ...props
}: AlertProps) {
  // Mapear variant a tono si no se especificó tono
  let resolvedTono: AlertTono = tono ?? "error";
  if (!tono && variant) {
    if (variant === "destructive") resolvedTono = "error";
    else if (variant === "warning") resolvedTono = "advertencia";
    else if (variant === "success") resolvedTono = "exito";
    else if (variant === "info") resolvedTono = "info";
  }

  const { estilo, Icono } = TONO_CONFIG[resolvedTono];
  const role = resolvedTono === "error" || resolvedTono === "advertencia" ? "alert" : "status";

  return (
    <div
      role={role}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
        estilo,
        className
      )}
      {...props}
    >
      {mostrarIcono && <Icono className="h-4 w-4 shrink-0 mt-0.5" />}
      <div className="flex-1 space-y-1">
        {titulo && <h5 className="font-semibold leading-none tracking-tight">{titulo}</h5>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
