import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  buscarAcreditados,
  buscarAcreditadosPaginados,
  obtenerPerfilRiesgoAcreditado,
} from "@/features/acreditados/api/acreditadosApi";
import type { BusquedaAcreditados } from "@/features/acreditados/types/acreditados";

export function useBuscarAcreditados(nombre: string) {
  return useQuery({
    queryKey: ["acreditados", "buscar", nombre],
    queryFn: () => buscarAcreditados(nombre),
    enabled: nombre.trim().length >= 2,
  });
}

export function useListaAcreditados(habilitado: boolean) {
  return useQuery({
    queryKey: ["acreditados", "lista"],
    queryFn: () => buscarAcreditados(""),
    enabled: habilitado,
    staleTime: 60_000,
  });
}

export function useAcreditadosPaginados(busqueda: BusquedaAcreditados, habilitado: boolean) {
  return useQuery({
    queryKey: ["acreditados", "pagina", busqueda],
    queryFn: () => buscarAcreditadosPaginados(busqueda),
    enabled: habilitado,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function usePerfilRiesgoAcreditado() {
  return useMutation({
    mutationFn: obtenerPerfilRiesgoAcreditado,
  });
}

export function usePerfilAcreditado(referencia: string | undefined) {
  return useQuery({
    queryKey: ["acreditados", "perfil", referencia ?? null],
    queryFn: () => obtenerPerfilRiesgoAcreditado(referencia ?? ""),
    enabled: Boolean(referencia),
    staleTime: 60_000,
  });
}
