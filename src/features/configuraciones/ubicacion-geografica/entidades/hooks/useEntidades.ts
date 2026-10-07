import { useQuery } from "@tanstack/react-query";

<<<<<<< HEAD
import { listarEntidades, obtenerZonaIdsDeEntidad } from "../api/entidadesApi";
=======
import { listarEntidades, obtenerZonasDeEntidad } from "../api/entidadesApi";
>>>>>>> origin/develop
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

<<<<<<< HEAD
/** Zonas actuales de una entidad, para conservar las especiales al editarla. */
export function useZonaIdsDeEntidad(id: string | null) {
  return useQuery({
    queryKey: entidadesKeys.zonasDeEntidad(id ?? ""),
    queryFn: () => obtenerZonaIdsDeEntidad(id as string),
    enabled: id !== null,
=======
/**
 * Carga los IDs de zonas geográficas asignadas a una entidad específica.
 * Solo ejecuta la query cuando se proporciona un id de entidad.
 */
export function useZonasDeEntidad(id: string | undefined) {
  return useQuery({
    queryKey: entidadesKeys.zonasDeEntidad(id),
    queryFn: () => obtenerZonasDeEntidad(id!),
    enabled: Boolean(id),
>>>>>>> origin/develop
  });
}
