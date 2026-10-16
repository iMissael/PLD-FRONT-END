import { useMemo, useState } from "react";
import { toast } from "sonner";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Badge } from "@/shared/components/atoms/Badge";
import { Button } from "@/shared/components/atoms/Button";
import { Checkbox } from "@/shared/components/atoms/Checkbox";
import { usePermisos } from "@/features/configuraciones/administracion/permisos/hooks/usePermisos";
import type { PermisoResponse } from "@/features/configuraciones/administracion/permisos/types/permisos";
import {
  useAsignarPermisosEnLote,
  useRevocarPermiso,
  useRolPermisos,
} from "@/features/configuraciones/administracion/roles/hooks/useRoles";

/** Agrupa por recurso (orden alfabético) para no mostrar una lista plana de decenas de permisos. */
function agruparPorRecurso(permisos: PermisoResponse[]) {
  const grupos = new Map<string, PermisoResponse[]>();
  for (const permiso of permisos) {
    const recurso = permiso.recurso ?? "—";
    if (!grupos.has(recurso)) grupos.set(recurso, []);
    grupos.get(recurso)!.push(permiso);
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));
}

export function RolPermisosManager({ rolId }: { rolId: string }) {
  const { data: permisosAsignados, isLoading } = useRolPermisos(rolId);
  const { data: todosPermisos } = usePermisos();
  const asignarPermisos = useAsignarPermisosEnLote(rolId);
  const revocarPermiso = useRevocarPermiso(rolId);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());

  const permisosDisponibles = useMemo(() => {
    const asignadosIds = new Set((permisosAsignados ?? []).map((p) => p.idPermiso));
    return (todosPermisos ?? []).filter(
      (p) => p.idPermiso && !asignadosIds.has(p.idPermiso),
    );
  }, [permisosAsignados, todosPermisos]);

  const gruposDisponibles = useMemo(
    () => agruparPorRecurso(permisosDisponibles),
    [permisosDisponibles],
  );

  function alternar(id: number, marcado: boolean) {
    setSeleccionados((actual) => {
      const copia = new Set(actual);
      if (marcado) copia.add(id);
      else copia.delete(id);
      return copia;
    });
  }

  function alternarGrupo(permisos: PermisoResponse[], marcado: boolean) {
    setSeleccionados((actual) => {
      const copia = new Set(actual);
      for (const p of permisos) {
        if (!p.idPermiso) continue;
        if (marcado) copia.add(p.idPermiso);
        else copia.delete(p.idPermiso);
      }
      return copia;
    });
  }

  function handleAsignar() {
    if (seleccionados.size === 0) return;
    asignarPermisos.mutate([...seleccionados], {
      onSuccess: ({ asignados, fallidos }) => {
        const partes = [`Se asignaron ${asignados} permisos.`];
        if (fallidos > 0) partes.push(`${fallidos} no se pudieron asignar.`);
        if (fallidos > 0) toast.warning(partes.join(" "));
        else toast.success(partes.join(" "));
        setSeleccionados(new Set());
      },
      onError: () => toast.error("No se pudieron asignar los permisos"),
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-sm font-medium">Asignar permisos</span>
        {gruposDisponibles.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay permisos disponibles para asignar.
          </p>
        ) : (
          <div className="max-h-80 space-y-3 overflow-y-auto rounded-md border p-3">
            {gruposDisponibles.map(([recurso, permisos]) => {
              const idsGrupo = permisos.map((p) => p.idPermiso).filter((id): id is number => !!id);
              const grupoCompleto = idsGrupo.every((id) => seleccionados.has(id));
              return (
                <div key={recurso}>
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase select-none">
                    <Checkbox
                      checked={grupoCompleto}
                      onCheckedChange={(marcado) => alternarGrupo(permisos, Boolean(marcado))}
                    />
                    {recurso}
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-3 pl-6">
                    {permisos.map((permiso) => (
                      <label
                        key={permiso.idPermiso}
                        className="flex cursor-pointer items-center gap-1.5 text-sm select-none"
                      >
                        <Checkbox
                          checked={!!permiso.idPermiso && seleccionados.has(permiso.idPermiso)}
                          onCheckedChange={(marcado) =>
                            permiso.idPermiso && alternar(permiso.idPermiso, Boolean(marcado))
                          }
                        />
                        {permiso.accion}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Button
          onClick={handleAsignar}
          disabled={seleccionados.size === 0 || asignarPermisos.isPending}
        >
          {asignarPermisos.isPending
            ? "Asignando…"
            : `Asignar${seleccionados.size > 0 ? ` (${seleccionados.size})` : ""}`}
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
                className="text-destructive hover:bg-destructive/10"
                disabled={revocarPermiso.isPending}
                onClick={() => {
                  if (permiso.idPermiso) {
                    if (
                      !window.confirm(
                        `¿Está seguro de revocar el permiso ${permiso.recurso}:${permiso.accion}?`,
                      )
                    ) {
                      return;
                    }
                    revocarPermiso.mutate(permiso.idPermiso, {
                      onSuccess: () => toast.success("Permiso revocado correctamente"),
                      onError: (error) =>
                        toast.error(
                          isAppError(error) ? error.message : "No se pudo revocar el permiso",
                        ),
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
