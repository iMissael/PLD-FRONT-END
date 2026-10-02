import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarRegla,
  cambiarEstadoRegla,
  crearRegla,
  eliminarRegla,
  listarReglas,
} from "../api/reglasAlertaApi";
import type { EstadoRegla, FiltroReglas, GuardarReglaInput } from "../types/reglaAlerta";

export const reglasAlertaKeys = {
  all: ["reglas-alerta"] as const,
  lista: (filtro: FiltroReglas, pagina: number, tamanio: number) =>
    [...reglasAlertaKeys.all, "lista", filtro, pagina, tamanio] as const,
};

export function useReglasAlerta(filtro: FiltroReglas, pagina: number, tamanio: number) {
  return useQuery({
    queryKey: reglasAlertaKeys.lista(filtro, pagina, tamanio),
    queryFn: () => listarReglas(filtro, pagina, tamanio),
    placeholderData: keepPreviousData,
  });
}

function useInvalidar() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: reglasAlertaKeys.all });
}

export function useCrearRegla() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (input: GuardarReglaInput) => crearRegla(input),
    onSuccess: invalidar,
  });
}

export function useActualizarRegla() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: GuardarReglaInput }) =>
      actualizarRegla(id, input),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoRegla() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoRegla }) =>
      cambiarEstadoRegla(id, estado),
    onSuccess: invalidar,
  });
}

export function useEliminarRegla() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (id: string) => eliminarRegla(id),
    onSuccess: invalidar,
  });
}
