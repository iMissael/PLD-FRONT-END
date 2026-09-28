import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearNuevaVersion,
  listarVersiones,
  obtenerConfiguracionActiva,
  obtenerVersionPorId,
} from "@/features/configuraciones/matriz-riesgo/api/matrizRiesgoApi";

const matrizRiesgoKeys = {
  activa: ["matriz-riesgo", "activa"] as const,
  versiones: ["matriz-riesgo", "versiones"] as const,
  version: (id: number) => ["matriz-riesgo", "version", id] as const,
};

export function useConfiguracionActiva() {
  return useQuery({
    queryKey: matrizRiesgoKeys.activa,
    queryFn: obtenerConfiguracionActiva,
  });
}

export function useVersionesMatriz() {
  return useQuery({
    queryKey: matrizRiesgoKeys.versiones,
    queryFn: listarVersiones,
  });
}

export function useVersionMatriz(id: number | null) {
  return useQuery({
    queryKey: matrizRiesgoKeys.version(id ?? -1),
    queryFn: () => obtenerVersionPorId(id as number),
    enabled: id !== null,
  });
}

export function useCrearNuevaVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearNuevaVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matrizRiesgoKeys.activa });
      queryClient.invalidateQueries({ queryKey: matrizRiesgoKeys.versiones });
    },
  });
}
