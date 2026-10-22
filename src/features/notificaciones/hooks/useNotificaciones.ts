import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  contarNoLeidas,
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
} from "../api/notificacionesApi";

const REFRESCO_MS = 2 * 60 * 1000;

export const notificacionesKeys = {
  all: ["notificaciones"] as const,
  noLeidas: () => [...notificacionesKeys.all, "no-leidas"] as const,
  lista: (soloNoLeidas: boolean, pagina: number, tamanio: number) =>
    [...notificacionesKeys.all, "lista", soloNoLeidas, pagina, tamanio] as const,
};

export function useNoLeidas(habilitado: boolean) {
  return useQuery({
    queryKey: notificacionesKeys.noLeidas(),
    queryFn: contarNoLeidas,
    enabled: habilitado,
    refetchInterval: REFRESCO_MS,
  });
}

export function useNotificaciones(
  soloNoLeidas: boolean,
  pagina: number,
  tamanio: number,
  habilitado = true,
) {
  return useQuery({
    queryKey: notificacionesKeys.lista(soloNoLeidas, pagina, tamanio),
    queryFn: () => listarNotificaciones(soloNoLeidas, pagina, tamanio),
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });
}

function useInvalidar() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: notificacionesKeys.all });
}

export function useMarcarLeida() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (id: number) => marcarLeida(id),
    onSuccess: invalidar,
  });
}

export function useMarcarTodasLeidas() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: marcarTodasLeidas, onSuccess: invalidar });
}
