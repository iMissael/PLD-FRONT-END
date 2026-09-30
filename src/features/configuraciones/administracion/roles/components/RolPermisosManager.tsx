import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { usePermisos } from "@/features/configuraciones/administracion/permisos/hooks/usePermisos";
import {
  useAsignarPermiso,
  useRevocarPermiso,
  useRolPermisos,
} from "@/features/configuraciones/administracion/roles/hooks/useRoles";

export function RolPermisosManager({ rolId }: { rolId: string }) {
  const { data: permisosAsignados, isLoading } = useRolPermisos(rolId);
  const { data: todosPermisos } = usePermisos();
  const asignarPermiso = useAsignarPermiso(rolId);
  const revocarPermiso = useRevocarPermiso(rolId);
  const [permisoSeleccionado, setPermisoSeleccionado] = useState<string>("");

  const permisosDisponibles = useMemo(() => {
    const asignadosIds = new Set((permisosAsignados ?? []).map((p) => p.idPermiso));
    return (todosPermisos ?? []).filter(
      (p) => p.idPermiso && !asignadosIds.has(p.idPermiso),
    );
  }, [permisosAsignados, todosPermisos]);

  function handleAsignar() {
    if (!permisoSeleccionado) return;
    asignarPermiso.mutate(Number(permisoSeleccionado), {
      onSuccess: () => {
        toast.success("Permiso asignado");
        setPermisoSeleccionado("");
      },
      onError: () => toast.error("No se pudo asignar el permiso"),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="w-64 space-y-1">
          <span className="text-sm font-medium">Asignar permiso</span>
          <Select value={permisoSeleccionado} onValueChange={setPermisoSeleccionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un permiso" />
            </SelectTrigger>
            <SelectContent>
              {permisosDisponibles.map((permiso) => (
                <SelectItem key={permiso.idPermiso} value={String(permiso.idPermiso ?? "")}>
                  {permiso.recurso}:{permiso.accion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAsignar}
          disabled={!permisoSeleccionado || asignarPermiso.isPending}
        >
          Asignar
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando permisos…</p>
      ) : !permisosAsignados || permisosAsignados.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Este rol no tiene permisos asignados.
        </p>
      ) : (
        <ul className="space-y-2">
          {permisosAsignados.map((permiso) => (
            <li
              key={permiso.idPermiso}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <Badge variant="outline">
                {permiso.recurso}:{permiso.accion}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                disabled={revocarPermiso.isPending}
                onClick={() => {
                  if (permiso.idPermiso) {
                    revocarPermiso.mutate(permiso.idPermiso, {
                      onSuccess: () => toast.success("Permiso revocado"),
                      onError: () => toast.error("No se pudo revocar el permiso"),
                    });
                  }
                }}
              >
                Revocar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
