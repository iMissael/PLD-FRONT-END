import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  buscarSocios,
  buscarSociosPaginados,
  obtenerPerfilRiesgoSocio,
} from "@/features/socios/api/sociosApi";
import type { BusquedaSocios } from "@/features/socios/types/socios";

export function useBuscarSocios(nombre: string) {
  return useQuery({
    queryKey: ["socios", "buscar", nombre],
    queryFn: () => buscarSocios(nombre),
    enabled: nombre.trim().length >= 2,
  });
}

export function useListaSocios(habilitado: boolean) {
  return useQuery({
    queryKey: ["socios", "lista"],
    queryFn: () => buscarSocios(""),
    enabled: habilitado,
    staleTime: 60_000,
  });
}

export function useSociosPaginados(busqueda: BusquedaSocios, habilitado: boolean) {
  return useQuery({
    queryKey: ["socios", "pagina", busqueda],
    queryFn: () => buscarSociosPaginados(busqueda),
    enabled: habilitado,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function usePerfilRiesgoSocio() {
  return useMutation({
    mutationFn: obtenerPerfilRiesgoSocio,
  });
}

export function usePerfilSocio(referencia: string | undefined) {
  return useQuery({
    queryKey: ["socios", "perfil", referencia ?? null],
    queryFn: () => obtenerPerfilRiesgoSocio(referencia ?? ""),
    enabled: Boolean(referencia),
    staleTime: 60_000,
  });
}
