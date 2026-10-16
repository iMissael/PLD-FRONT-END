import { PlaceholderPage } from "@/shared/components/templates/PlaceholderPage";

/**
 * Punto de entrada del dominio "Operación". Hoy es un placeholder; cuando se
 * definan las vistas reales (p.ej. seguimiento de casos, tableros
 * operativos), agrégalas como archivos hermanos en este mismo directorio
 * (`pages/`, con su `api/`, `hooks/`, `types/` propios si lo ameritan) y
 * súmalas como hijas de "Operación" en `NAV_ITEMS` (AppLayout.tsx).
 */
export function OperacionPage() {
  return (
    <PlaceholderPage
      title="Operación"
      description="Hola mundo, esta sección todavía no tiene vistas definidas. Cuando se agreguen, aparecerán aquí."
    />
  );
}
