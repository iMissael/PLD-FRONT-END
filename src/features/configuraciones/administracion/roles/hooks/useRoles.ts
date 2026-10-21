import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  asignarPermisoARol,
  crearRol,
  eliminarRol,
  listarPermisosDeRol,
  listarRoles,
  revocarPermisoDeRol,
} from "@/features/configuraciones/administracion/roles/api/rolesApi";

const rolesKeys = {
  all: ["roles"] as const,
  permisos: (rolId: string) => ["roles", rolId, "permisos"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: rolesKeys.all,
    queryFn: listarRoles,
  });
}

export function useCrearRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
}

export function useEliminarRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarRol(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
}

// rolId llega como string (viene de la URL / de un <Select>); se convierte a
// number justo antes de golpear la API, que ya espera el id real (Long).
export function useRolPermisos(rolId: string) {
  return useQuery({
    queryKey: rolesKeys.permisos(rolId),
    queryFn: () => listarPermisosDeRol(Number(rolId)),
    enabled: Boolean(rolId),
  });
}

/**
 * Asigna varios permisos de una sola vez: el backend solo tiene POST /roles/{rolId}/permisos/
 * {permisoId} de a uno, así que se manda una petición por permiso y se sigue aunque alguna falle.
 */
export function useAsignarPermisosEnLote(rolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permisoIds: number[]) => {
      const resultados = await Promise.allSettled(
        permisoIds.map((permisoId) => asignarPermisoARol(Number(rolId), permisoId)),
      );
      const asignados = resultados.filter((r) => r.status === "fulfilled").length;
      return { asignados, fallidos: resultados.length - asignados };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.permisos(rolId) });
    },
  });
}

export function useRevocarPermiso(rolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permisoId: number) => revocarPermisoDeRol(Number(rolId), permisoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.permisos(rolId) });
    },
  });
}
