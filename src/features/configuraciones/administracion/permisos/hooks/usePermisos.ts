import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearPermiso,
  eliminarPermiso,
  listarPermisos,
  listarTodosLosPermisos,
} from "@/features/configuraciones/administracion/permisos/api/permisosApi";
import type {
  CrearPermisoRequest,
  FiltroPermisos,
  PermisoResponse,
} from "@/features/configuraciones/administracion/permisos/types/permisos";

const permisosKeys = {
  all: ["permisos"] as const,
  listas: () => [...permisosKeys.all, "lista"] as const,
  lista: (filtro: FiltroPermisos, pagina: number, tamanio: number) =>
    [...permisosKeys.listas(), filtro, pagina, tamanio] as const,
  todos: () => [...permisosKeys.all, "todos"] as const,
};

/** Para la tabla del catálogo: paginación real del backend, igual que los demás catálogos. */
export function usePermisos(filtro: FiltroPermisos, pagina: number, tamanio: number) {
  return useQuery({
    queryKey: permisosKeys.lista(filtro, pagina, tamanio),
    queryFn: () => listarPermisos(filtro, pagina, tamanio),
    placeholderData: keepPreviousData,
  });
}

/**
 * Catálogo completo, para los selects/combos que necesitan verlo entero (crear permisos en
 * lote y detectar cuáles ya existen; agrupar los disponibles al asignarle permisos a un rol).
 */
export function useTodosPermisos() {
  return useQuery({
    queryKey: permisosKeys.todos(),
    queryFn: listarTodosLosPermisos,
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

