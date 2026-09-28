import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listarLocalidades, type ListarLocalidadesParams } from "../api/localidadesApi";
import { listarMunicipios } from "../api/municipiosApi";
import { localidadesKeys, municipiosKeys } from "./localidadesKeys";

/**
 * Listado paginado de localidades.
 *
 * `keepPreviousData` deja visible la página anterior mientras llega la
 * siguiente: sin eso, cada cambio de página vacía la tabla y la pantalla
 * "salta". Con ~296 mil filas el usuario pagina seguido, así que importa.
 */
export function useLocalidades(params?: ListarLocalidadesParams) {
  return useQuery({
    queryKey: localidadesKeys.lista(params),
    queryFn: () => listarLocalidades(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Municipios de una entidad, para el `<select>` en cascada Entidad ->
 * Municipio. Acepta `busqueda` porque una entidad puede tener cientos de
 * municipios y el backend ya soporta filtrarlos por nombre.
 */
export function useMunicipiosDeEntidad(entidadId: string | null, busqueda?: string) {
  const params = entidadId
    ? { entidadId, ...(busqueda?.trim() ? { busqueda: busqueda.trim() } : {}) }
    : undefined;

  return useQuery({
    queryKey: municipiosKeys.lista(params),
    queryFn: () => listarMunicipios(params),
    enabled: entidadId !== null,
  });
}
