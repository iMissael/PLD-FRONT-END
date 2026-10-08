import { useQuery } from "@tanstack/react-query";

import { listarEntidades, obtenerZonasDeEntidad } from "../api/entidadesApi";
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

/**
 * Carga los IDs de zonas geográficas asignadas a una entidad específica.
 * Solo ejecuta la query cuando se proporciona un id de entidad.
 */
export function useZonasDeEntidad(id: string | undefined) {
  return useQuery({
    queryKey: entidadesKeys.zonasDeEntidad(id),
    queryFn: () => obtenerZonasDeEntidad(id!),
    enabled: Boolean(id),
  });
}
