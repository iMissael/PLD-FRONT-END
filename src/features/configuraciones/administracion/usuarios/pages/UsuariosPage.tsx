import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { UsuarioForm } from "@/features/configuraciones/administracion/usuarios/components/UsuarioForm";
import { UsuariosTable } from "@/features/configuraciones/administracion/usuarios/components/UsuariosTable";

export function UsuariosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <p className="text-muted-foreground">Alta y consulta de usuarios del sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <UsuarioForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent>
          <UsuariosTable />
        </CardContent>
      </Card>
    </div>
  );
}
