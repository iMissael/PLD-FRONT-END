import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listarAutorizaciones, obtenerAutorizacion } from "../api/autorizacionesApi";
import type { FiltroAutorizaciones } from "../types/autorizaciones";

export const autorizacionesKeys = {
  all: ["alertas-autorizacion"] as const,
  lista: (filtro: FiltroAutorizaciones | null, pagina: number, tamanio: number) =>
    [...autorizacionesKeys.all, "lista", filtro, pagina, tamanio] as const,
  detalle: (id: number) => [...autorizacionesKeys.all, "detalle", id] as const,
};

export function useListaAutorizaciones(
  filtro: FiltroAutorizaciones | null,
  pagina: number,
  tamanio: number,
) {
  return useQuery({
    queryKey: autorizacionesKeys.lista(filtro, pagina, tamanio),
    queryFn: () => listarAutorizaciones(filtro as FiltroAutorizaciones, pagina, tamanio),
    enabled: filtro !== null,
    placeholderData: keepPreviousData,
  });
}

export function useDetalleAutorizacion(id: number | null) {
  return useQuery({
    queryKey: autorizacionesKeys.detalle(id ?? 0),
    queryFn: () => obtenerAutorizacion(id as number),
    enabled: id !== null,
  });
}
