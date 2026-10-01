import { useMemo, useState, type ReactNode } from "react";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useOficialCumplimiento } from "@/features/configuraciones/oficial-cumplimiento/hooks/useOficialCumplimiento";
import { EncabezadoOficial } from "@/features/configuraciones/oficial-cumplimiento/components/EncabezadoOficial";
import { OficialCumplimientoForm } from "@/features/configuraciones/oficial-cumplimiento/components/OficialCumplimientoForm";
import { useRoles } from "@/features/configuraciones/administracion/roles/hooks/useRoles";
import { useUsuarios } from "@/features/configuraciones/administracion/usuarios/hooks/useUsuarios";
import type { UsuarioResponse } from "@/features/configuraciones/administracion/usuarios/types/usuarios";
import { esRolOficial } from "@/features/configuraciones/administracion/usuarios/utils/usuarios";
import { useAuthStore } from "@/shared/auth/authStore";

function nombreCompleto(usuario: UsuarioResponse) {
  return [usuario.nombre, usuario.primerApellido, usuario.segundoApellido]
    .filter(Boolean)
    .join(" ");
}

function Aviso({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm text-foreground">
      {children}
    </div>
  );
}

/** Datos del oficial de cumplimiento: identificación, domicilio y parámetros PLD. */
export function OficialCumplimientoPage() {
  const rutaEnTenant = useRutaTenant();
  const miId = useAuthStore((s) => s.usuario?.id);
  const {
    data: usuarios,
    isPending: cargandoUsuarios,
    isError: errorUsuarios,
  } = useUsuarios();
  const { data: roles, isPending: cargandoRoles, isError: errorRoles } = useRoles();
  const [seleccion, setSeleccion] = useState<string>();

  const oficiales = useMemo(
    () =>
      (usuarios ?? []).filter(
        (usuario) => usuario.estado !== "ELIMINADO" && esRolOficial(roles, usuario.rolId),
      ),
    [usuarios, roles],
  );
  const usuarioIdPorDefecto =
    oficiales.find((oficial) => oficial.idUsuario === miId)?.idUsuario ??
    oficiales[0]?.idUsuario;
  const usuarioId = seleccion !== undefined ? Number(seleccion) : usuarioIdPorDefecto;

  const { usuario, domicilio, oficial, cargando, hayError } =
    useOficialCumplimiento(usuarioId);

  const selector =
    oficiales.length > 1 ? (
      <div className="max-w-sm space-y-2">
        <Label
          htmlFor="selector-oficial"
          className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
        >
          Oficial de cumplimiento
        </Label>
        <Select
          value={usuarioId !== undefined ? String(usuarioId) : undefined}
          onValueChange={setSeleccion}
        >
          <SelectTrigger
            id="selector-oficial"
            className="h-10 w-full border-border bg-card text-foreground font-semibold data-[size=default]:h-10"
          >
            <SelectValue placeholder="Selecciona un oficial" />
          </SelectTrigger>
          <SelectContent>
            {oficiales.map((item) => (
              <SelectItem key={item.idUsuario} value={String(item.idUsuario ?? "")}>
                {nombreCompleto(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ) : null;

  if (usuarioId && !hayError && !cargando && usuario) {
    return (
      <OficialCumplimientoForm
        key={usuario.idUsuario}
        usuario={usuario}
        domicilio={domicilio ?? null}
        oficial={oficial ?? null}
        selector={selector}
      />
    );
  }

  return (
    <div className="space-y-6">
      <EncabezadoOficial />
      {selector}
      {cargandoUsuarios || cargandoRoles ? (
        <Skeleton className="h-96 w-full" />
      ) : errorUsuarios || errorRoles ? (
        <Aviso>
          <p className="text-destructive text-sm">
            No se pudo cargar la lista de usuarios, por eso no se puede buscar al oficial.
            Intenta de nuevo en unos segundos.
          </p>
        </Aviso>
      ) : !usuarioId ? (
        <Aviso>
          <p className="font-semibold text-slate-900">
            Esta empresa aún no tiene un oficial de cumplimiento registrado.
          </p>
          <p className="text-sm text-slate-600">
            Crea un usuario con el rol de oficial de cumplimiento y aquí verás sus datos.
            Si esperabas ver uno, revisa que hayas entrado a la empresa correcta.
          </p>
          <Button asChild variant="outline">
            <Link to={rutaEnTenant("configuraciones/administracion/usuarios")}>
              Ir a usuarios
            </Link>
          </Button>
        </Aviso>
      ) : hayError ? (
        <Aviso>
          <p className="text-destructive text-sm">
            No se pudieron cargar los datos del oficial. Intenta de nuevo en unos
            segundos.
          </p>
        </Aviso>
      ) : (
        <Skeleton className="h-96 w-full" />
      )}
    </div>
  );
}
