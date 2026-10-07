import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { paisesKeys } from "../../paises/hooks/paisesKeys";
import {
  actualizarLista,
  crearLista,
  eliminarLista,
  listarListas,
  listarPaisesDeLista,
} from "../api/listasPaisesApi";
import type { EstatusLista, ListaPaisInput } from "../types/listaPais";
import { listasPaisesKeys } from "./listasPaisesKeys";

export function useListasPaises(estatus?: EstatusLista) {
  return useQuery({
    queryKey: listasPaisesKeys.lista(estatus),
    queryFn: () => listarListas(estatus),
  });
}

/** Catálogo de listas para los selectores de otros features (Países). */
export function useListasPaisesSelect() {
  return useQuery({
    queryKey: listasPaisesKeys.lista(),
    queryFn: () => listarListas(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaisesDeLista(id: string, enabled: boolean) {
  return useQuery({
    queryKey: listasPaisesKeys.paisesDeLista(id),
    queryFn: () => listarPaisesDeLista(id),
    enabled,
  });
}

function useInvalidarListas() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: listasPaisesKeys.all });
    queryClient.invalidateQueries({ queryKey: paisesKeys.all });
  };
}

export function useCrearLista() {
  const invalidar = useInvalidarListas();
  return useMutation({ mutationFn: (input: ListaPaisInput) => crearLista(input), onSuccess: invalidar });
}

export function useActualizarLista() {
  const invalidar = useInvalidarListas();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ListaPaisInput }) => actualizarLista(id, input),
    onSuccess: invalidar,
  });
}

export function useEliminarLista() {
  const invalidar = useInvalidarListas();
  return useMutation({ mutationFn: (id: string) => eliminarLista(id), onSuccess: invalidar });
}
