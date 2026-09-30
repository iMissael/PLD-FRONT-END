import { SettingsIcon } from "@/shared/components/icons";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

/**
 * Pantalla temporal para secciones del menú que ya tienen ruta pero cuyo
 * contenido aún no se ha definido (p.ej. Operación y Control dentro de
 * Configuraciones). Evita enlaces rotos mientras se define el alcance real.
 */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center shadow-xs">
      <span className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
        <SettingsIcon className="h-6 w-6" />
      </span>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {description ?? "Esta sección está en construcción."}
      </p>
    </div>
  );
}
