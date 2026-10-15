import React from "react";
import { cn } from "@/shared/utils/cn";

export interface PageFooterProps extends React.HTMLAttributes<HTMLElement> {
  sistema?: string;
  modulo?: string;
}

export function PageFooter({
  sistema = "SICANET SC · Módulo de Prevención de Lavado de Dinero",
  modulo,
  className,
  children,
  ...props
}: PageFooterProps) {
  return (
    <footer
      className={cn(
        "mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 pb-2 text-xs text-muted-foreground select-none",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span>{sistema}</span>
        {modulo && (
          <>
            <span className="opacity-40">·</span>
            <span className="font-medium text-foreground/80">{modulo}</span>
          </>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </footer>
  );
}
