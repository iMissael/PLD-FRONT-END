import type { ReactNode } from "react";
import { FolderSearch, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface EmptyStateProps {
  icono?: LucideIcon;
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
  className?: string;
}

export function EmptyState({
  icono: Icono = FolderSearch,
  titulo,
  descripcion,
  accion,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center gap-3.5 rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center transition-colors",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/60 text-muted-foreground shadow-xs">
        <Icono className="size-7 text-primary/80" strokeWidth={1.6} />
      </div>

      <div className="max-w-md space-y-1">
        <h4 className="text-base font-semibold tracking-tight text-foreground">{titulo}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{descripcion}</p>
      </div>

      {accion && <div className="mt-2 flex items-center gap-2">{accion}</div>}
    </div>
  );
}
