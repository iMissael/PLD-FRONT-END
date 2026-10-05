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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { UsuarioForm } from "@/features/configuraciones/administracion/usuarios/components/UsuarioForm";
import { UsuariosTable } from "@/features/configuraciones/administracion/usuarios/components/UsuariosTable";
import { useDetalleUsuario } from "@/features/configuraciones/administracion/usuarios/hooks/useUsuarios";
import type { UsuarioResponse } from "@/features/configuraciones/administracion/usuarios/types/usuarios";
import { valoresDeUsuario } from "@/features/configuraciones/administracion/usuarios/utils/usuarios";

type Formulario = { tipo: "cerrado" } | { tipo: "nuevo" } | { tipo: "editar"; usuario: UsuarioResponse };

/** Carga domicilio y datos de oficial antes de abrir el formulario con todo precargado. */
function EditarUsuario({ usuario, onGuardado }: { usuario: UsuarioResponse; onGuardado: () => void }) {
  const { data, isLoading, isError } = useDetalleUsuario(usuario.idUsuario);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <p className="text-destructive text-sm">No se pudieron cargar los datos del usuario.</p>
    );
  }
  return (
    <UsuarioForm
      key={usuario.idUsuario}
      onCreado={onGuardado}
      edicion={{ usuario, valores: valoresDeUsuario(usuario, data.domicilio, data.oficial) }}
    />
  );
}

export function UsuariosPage() {
  const [formulario, setFormulario] = useState<Formulario>({ tipo: "cerrado" });
  const cerrar = () => setFormulario({ tipo: "cerrado" });
  const abierto = formulario.tipo !== "cerrado";

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
          variant={abierto ? "outline" : "default"}
          onClick={() => setFormulario(abierto ? { tipo: "cerrado" } : { tipo: "nuevo" })}
        >
          {abierto ? <X /> : <UserPlus />}
          {abierto ? "Cancelar" : "Nuevo usuario"}
        </Button>
      </div>

      {abierto && (
        <Card className="animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle>
              {formulario.tipo === "editar"
                ? `Editar a ${formulario.usuario.nombre ?? formulario.usuario.username}`
                : "Nuevo usuario"}
            </CardTitle>
            <CardDescription>
              {formulario.tipo === "editar"
                ? "Actualiza sus datos, domicilio y rol. La contraseña y el username no se cambian aquí."
                : "Completa los 3 pasos para dar de alta un usuario y su acceso al sistema."}
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Cerrar formulario"
                onClick={cerrar}
              >
                <X />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {formulario.tipo === "editar" ? (
              <EditarUsuario
                key={formulario.usuario.idUsuario}
                usuario={formulario.usuario}
                onGuardado={cerrar}
              />
            ) : (
              <UsuarioForm onCreado={cerrar} />
            )}
          </CardContent>
        </Card>
      )}

      <UsuariosTable
        onEditar={(usuario) => {
          setFormulario({ tipo: "editar", usuario });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
