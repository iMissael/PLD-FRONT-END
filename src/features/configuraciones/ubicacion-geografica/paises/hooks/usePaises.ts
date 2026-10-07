import { useQuery } from "@tanstack/react-query";

import { listarPaises, obtenerListaIdsDePais } from "../api/paisesApi";
import { paisesKeys } from "./paisesKeys";

export function usePaises(params?: { busqueda?: string; filtrarPor?: string }) {
  return useQuery({
    queryKey: paisesKeys.lista(params),
    queryFn: () => listarPaises(params),
  });
}

/** IDs reales de las listas de riesgo de un país, para precargar el multi-select al editar. */
export function useListaIdsDePais(id: string | null) {
  return useQuery({
    queryKey: paisesKeys.listasDePais(id ?? ""),
    queryFn: () => obtenerListaIdsDePais(id as string),
    enabled: id !== null,
  });
}
