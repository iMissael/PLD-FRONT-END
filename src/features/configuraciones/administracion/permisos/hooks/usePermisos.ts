import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearPermiso,
  eliminarPermiso,
  listarPermisos,
} from "@/features/configuraciones/administracion/permisos/api/permisosApi";
import type {
  CrearPermisoRequest,
  PermisoResponse,
} from "@/features/configuraciones/administracion/permisos/types/permisos";

const permisosKeys = {
  all: ["permisos"] as const,
};

export function usePermisos() {
  return useQuery({
    queryKey: permisosKeys.all,
    queryFn: listarPermisos,
  });
}

/**
 * Crea varios permisos de una sola vez (un recurso-del-menú × acción marcada, ver
 * MENUS_PERMISO): el backend no tiene un endpoint de lote, así que se manda un POST por cada
 * combinación y se sigue aunque alguna falle (p. ej. ya existe, choca con uq_permiso_recurso_accion).
 */
export function useCrearPermisosEnLote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payloads: CrearPermisoRequest[]) => {
      const resultados = await Promise.allSettled(payloads.map((payload) => crearPermiso(payload)));
      const creados = resultados.filter(
        (r): r is PromiseFulfilledResult<PermisoResponse> => r.status === "fulfilled",
      ).length;
      return { creados, fallidos: resultados.length - creados };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permisosKeys.all });
    },
  });
}

export function useEliminarPermiso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarPermiso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permisosKeys.all });
    },
  });
}
