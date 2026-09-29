import { UserPlus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/shared/components/ui/card";
import { UsuarioForm } from "@/features/configuraciones/administracion/usuarios/components/UsuarioForm";
import { UsuariosTable } from "@/features/configuraciones/administracion/usuarios/components/UsuariosTable";

export function UsuariosPage() {
  const [formularioAbierto, setFormularioAbierto] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-muted-foreground">
            Alta y consulta de los usuarios que acceden al sistema.
          </p>
        </div>
        <Button
          variant={formularioAbierto ? "outline" : "default"}
          onClick={() => setFormularioAbierto((abierto) => !abierto)}
        >
          {formularioAbierto ? <X /> : <UserPlus />}
          {formularioAbierto ? "Cancelar" : "Nuevo usuario"}
        </Button>
      </div>

      {formularioAbierto && (
        <Card className="animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle>Nuevo usuario</CardTitle>
            <CardDescription>
              Completa los 3 pasos para dar de alta un usuario y su acceso al sistema.
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Cerrar formulario"
                onClick={() => setFormularioAbierto(false)}
              >
                <X />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <UsuarioForm onCreado={() => setFormularioAbierto(false)} />
          </CardContent>
        </Card>
      )}

      <UsuariosTable />
    </div>
  );
}
