import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PermisoForm } from "@/features/configuraciones/administracion/permisos/components/PermisoForm";
import { PermisosTable } from "@/features/configuraciones/administracion/permisos/components/PermisosTable";

export function PermisosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Permisos</h1>
        <p className="text-muted-foreground">Alta y consulta de permisos del sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo permiso</CardTitle>
        </CardHeader>
        <CardContent>
          <PermisoForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent>
          <PermisosTable />
        </CardContent>
      </Card>
    </div>
  );
}
