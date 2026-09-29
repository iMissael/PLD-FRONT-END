import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearPermiso,
  eliminarPermiso,
  listarPermisos,
} from "@/features/configuraciones/administracion/permisos/api/permisosApi";

const permisosKeys = {
  all: ["permisos"] as const,
};

export function usePermisos() {
  return useQuery({
    queryKey: permisosKeys.all,
    queryFn: listarPermisos,
  });
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
