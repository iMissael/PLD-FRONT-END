import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { RolForm } from "@/features/configuraciones/administracion/roles/components/RolForm";
import { RolesTable } from "@/features/configuraciones/administracion/roles/components/RolesTable";

export function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Roles</h1>
        <p className="text-muted-foreground">Alta y consulta de roles del sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo rol</CardTitle>
        </CardHeader>
        <CardContent>
          <RolForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent>
          <RolesTable />
        </CardContent>
      </Card>
    </div>
  );
}
