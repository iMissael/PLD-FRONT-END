import { useQuery } from "@tanstack/react-query";

import { listarPaises, obtenerZonaIdsDePais } from "../api/paisesApi";
import { paisesKeys } from "./paisesKeys";

export function usePaises(params?: { busqueda?: string; filtrarPor?: string }) {
  return useQuery({
    queryKey: paisesKeys.lista(params),
    queryFn: () => listarPaises(params),
  });
}

/** IDs de zona reales de un país, para precargar el multi-select al editar. */
export function useZonaIdsDePais(id: string | null) {
  return useQuery({
    queryKey: paisesKeys.zonasDePais(id ?? ""),
    queryFn: () => obtenerZonaIdsDePais(id as string),
    enabled: id !== null,
  });
}
