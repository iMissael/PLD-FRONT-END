import { type ReactNode } from "react";
import { Breadcrumbs } from "@/shared/components/organisms/Breadcrumbs";
import { PageFooter } from "@/shared/components/organisms/PageFooter";
import { cn } from "@/shared/utils/cn";

export interface DashboardDosColumnasTemplateProps {
  titulo?: ReactNode;
  descripcion?: ReactNode;
  acciones?: ReactNode;
  alerta?: ReactNode;
  mostrarBreadcrumbs?: boolean;
  mostrarFooter?: boolean;
  moduloFooter?: string;
  /**
   * Panel lateral (ej. Expediente del Socio, Selección de Entidad, Filtros)
   */
  columnaLateral: ReactNode;
  /**
   * Contenido principal (ej. Matriz de Riesgo, Historial, Detalle)
   */
  contenidoPrincipal?: ReactNode;
  /**
   * Ancho del panel lateral en resoluciones de escritorio (>= 1024px).
   * En resoluciones menores a 1024px siempre colapsa verticalmente (100%).
   */
  anchoLateralClassName?: string;
  className?: string;
  children?: ReactNode;
}

export function DashboardDosColumnasTemplate({
  titulo,
  descripcion,
  acciones,
  alerta,
  mostrarBreadcrumbs = true,
  mostrarFooter = true,
  moduloFooter,
  columnaLateral,
  contenidoPrincipal,
  anchoLateralClassName = "lg:w-80 xl:w-96",
  className,
  children,
}: DashboardDosColumnasTemplateProps) {
  const mainContent = contenidoPrincipal ?? children;

  return (
    <div className={cn("flex flex-col gap-6 pb-16", className)}>
      {mostrarBreadcrumbs && <Breadcrumbs />}

      {(titulo || acciones) && (
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            {titulo && (
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{titulo}</h2>
            )}
            {descripcion && (
              <p className="text-sm text-muted-foreground">{descripcion}</p>
            )}
          </div>

          {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
        </header>
      )}

      {alerta && <div>{alerta}</div>}

      {/* Grid responsivo: Stacking vertical en móviles/tablets (< 1024px) y 2 columnas en desktop */}
      <main className="flex flex-col lg:flex-row items-start gap-6 w-full">
        <aside className={cn("w-full shrink-0", anchoLateralClassName)}>
          {columnaLateral}
        </aside>

        <section className="flex-1 w-full min-w-0">
          {mainContent}
        </section>
      </main>

      {mostrarFooter && <PageFooter modulo={moduloFooter} />}
    </div>
  );
}
