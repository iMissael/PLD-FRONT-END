<<<<<<< HEAD
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
=======
import { useQuery } from "@tanstack/react-query";

import {
  listarListasPaises,
  listarPaisesDeLista,
  listarTodosLosPaisesConListas,
  obtenerListaPais,
  obtenerListasDePais,
} from "../api/listasPaisesApi";
import type { EstatusListaPais } from "../types/listaPais";
import { listasPaisesKeys } from "./listasPaisesKeys";

export function useListasPaises(estatus?: EstatusListaPais) {
  return useQuery({
    queryKey: listasPaisesKeys.list(estatus),
    queryFn: () => listarListasPaises(estatus),
  });
}

export function useListasPaisesSelect() {
  return useQuery({
    queryKey: listasPaisesKeys.list("A"),
    queryFn: () => listarListasPaises("A"),
>>>>>>> origin/develop
    staleTime: 5 * 60 * 1000,
  });
}

<<<<<<< HEAD
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
=======
export function useListaPais(id: string | null | undefined) {
  return useQuery({
    queryKey: listasPaisesKeys.detail(id ?? ""),
    queryFn: () => obtenerListaPais(id!),
    enabled: Boolean(id),
  });
}

export function usePaisesDeLista(id: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: listasPaisesKeys.paisesDeLista(id ?? ""),
    queryFn: () => listarPaisesDeLista(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function useListasDePais(idPais: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: listasPaisesKeys.listasDePais(idPais ?? ""),
    queryFn: () => obtenerListasDePais(idPais!),
    enabled: Boolean(idPais) && enabled,
  });
}

export function useTodosLosPaisesConListas() {
  return useQuery({
    queryKey: listasPaisesKeys.paisesConListas(),
    queryFn: listarTodosLosPaisesConListas,
  });
>>>>>>> origin/develop
}
