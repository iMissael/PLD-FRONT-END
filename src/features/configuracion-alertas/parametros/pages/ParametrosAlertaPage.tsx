import { useAuthStore } from "@/shared/auth/authStore";
import { Alert } from "@/shared/components/molecules";

import { DiasInhabilesSection } from "../components/DiasInhabilesSection";
import { ParametrosGeneralesSection } from "../components/ParametrosGeneralesSection";
import { PlazosTiposSection } from "../components/PlazosTiposSection";

export function ParametrosAlertaPage() {
  const puedeEditar = useAuthStore((estado) =>
    estado.hasPermission("configuracion_alertas", "modificar"),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Parámetros de alertas</h2>
        <p className="text-muted-foreground text-sm">
          Valores que usan las reglas y los plazos de las alertas. Se cambian aquí, sin
          tocar el sistema.
        </p>
      </div>
      {!puedeEditar ? (
        <Alert tono="info">
          Solo consulta: para modificar se necesita el permiso
          configuracion_alertas:modificar.
        </Alert>
      ) : null}
      <ParametrosGeneralesSection puedeEditar={puedeEditar} />
      <PlazosTiposSection puedeEditar={puedeEditar} />
      <DiasInhabilesSection puedeEditar={puedeEditar} />
    </div>
  );
}
