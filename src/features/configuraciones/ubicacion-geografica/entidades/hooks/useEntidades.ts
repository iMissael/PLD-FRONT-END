import { useQuery } from "@tanstack/react-query";

import { listarEntidades, obtenerZonaIdsDeEntidad } from "../api/entidadesApi";
import { entidadesKeys } from "./entidadesKeys";

export function useEntidades(params?: {
  busqueda?: string;
  filtrarPor?: string;
  idZona?: string;
}) {
  return useQuery({
    queryKey: entidadesKeys.lista(params),
    queryFn: () => listarEntidades(params),
  });
}

/** Zonas actuales de una entidad, para conservar las especiales al editarla. */
export function useZonaIdsDeEntidad(id: string | null) {
  return useQuery({
    queryKey: entidadesKeys.zonasDeEntidad(id ?? ""),
    queryFn: () => obtenerZonaIdsDeEntidad(id as string),
    enabled: id !== null,
  });
}
