import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearPermiso,
  eliminarPermiso,
  listarPermisos,
} from "@/features/configuraciones/administracion/permisos/api/permisosApi";
import { RECURSOS_SISTEMA_BASE } from "@/features/configuraciones/administracion/permisos/types/permisoSchema";
import type { PermisoResponse } from "@/features/configuraciones/administracion/permisos/types/permisos";

const permisosKeys = {
  all: ["permisos"] as const,
};

export function usePermisos() {
  return useQuery({
    queryKey: permisosKeys.all,
    queryFn: listarPermisos,
  });
}

export function useRecursosPermiso() {
  const { data: permisos, isLoading, isError } = usePermisos();

  const data = useMemo(() => {
    const conjunto = new Set<string>(RECURSOS_SISTEMA_BASE);
    const lista: PermisoResponse[] = Array.isArray(permisos)
      ? permisos
      : (permisos as unknown as { contenido?: PermisoResponse[] })?.contenido ?? [];

    if (Array.isArray(lista)) {
      lista.forEach((p) => {
        if (p.recurso?.trim()) {
          conjunto.add(p.recurso.trim());
        }
      });
    }

    return Array.from(conjunto).sort((a, b) => a.localeCompare(b, "es"));
  }, [permisos]);

  return { data, isLoading, isError };
}

export function useCrearPermiso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPermiso,
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
