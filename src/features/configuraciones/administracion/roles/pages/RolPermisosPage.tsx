import { Link, useParams } from "react-router-dom";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { RolPermisosManager } from "@/features/configuraciones/administracion/roles/components/RolPermisosManager";

export function RolPermisosPage() {
  const rutaEnTenant = useRutaTenant();
  const { rolId } = useParams<{ rolId: string }>();

  if (!rolId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Permisos del rol</h1>
          <p className="text-muted-foreground">Asigna o revoca permisos para este rol.</p>
        </div>
        <Button variant="outline" asChild>
          <Link to={rutaEnTenant("configuraciones/administracion/roles")}>
            Volver a roles
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permisos asignados</CardTitle>
        </CardHeader>
        <CardContent>
          <RolPermisosManager rolId={rolId} />
        </CardContent>
      </Card>
    </div>
  );
}
