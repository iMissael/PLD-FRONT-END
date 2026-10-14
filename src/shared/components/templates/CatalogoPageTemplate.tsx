import { type ReactNode } from "react";
import { PageFooter } from "@/shared/components/organisms/PageFooter";
import { cn } from "@/shared/utils/cn";

export interface CatalogoPageTemplateProps {
  titulo: ReactNode;
  descripcion?: ReactNode;
  acciones?: ReactNode;
  alerta?: ReactNode;
  mostrarFooter?: boolean;
  moduloFooter?: string;
  className?: string;
  children: ReactNode;
}

export function CatalogoPageTemplate({
  titulo,
  descripcion,
  acciones,
  alerta,
  mostrarFooter = true,
  moduloFooter,
  className,
  children,
}: CatalogoPageTemplateProps) {
  return (
    <div className={cn("flex flex-col gap-6 pb-16", className)}>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{titulo}</h2>
          {descripcion && (
            <p className="text-sm text-muted-foreground">{descripcion}</p>
          )}
        </div>

        {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
      </header>

      {alerta && <div>{alerta}</div>}

      <main className="flex flex-col gap-6">{children}</main>

      {mostrarFooter && <PageFooter modulo={moduloFooter} />}
    </div>
  );
}
