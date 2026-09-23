import { PlaceholderPage } from "@/shared/components/PlaceholderPage";

/**
 * Punto de entrada del dominio "Control". Hoy es un placeholder; cuando se
 * definan las vistas reales, agrégalas como archivos hermanos en este mismo
 * directorio (`pages/`, con su `api/`, `hooks/`, `types/` propios si lo
 * ameritan) y súmalas como hijas de "Control" en `NAV_ITEMS` (AppLayout.tsx).
 */
export function ControlPage() {
  return (
    <PlaceholderPage
      title="Control"
      description="Aquí vivirán las vistas del área de Control. Todavía no se definen."
    />
  );
}
