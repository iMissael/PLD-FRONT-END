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
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
      <span className="bg-primary-soft text-primary flex h-12 w-12 items-center justify-center rounded-full">
        <SettingsIcon className="h-6 w-6" />
      </span>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="max-w-sm text-sm text-slate-500">
        {description ?? "Esta sección está en construcción."}
      </p>
    </div>
  );
}
