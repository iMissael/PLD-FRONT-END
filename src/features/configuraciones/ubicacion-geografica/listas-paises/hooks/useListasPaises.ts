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
    staleTime: 5 * 60 * 1000,
  });
}

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
}
