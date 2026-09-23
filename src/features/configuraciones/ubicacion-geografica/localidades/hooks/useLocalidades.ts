import { useQuery } from "@tanstack/react-query";

import { listarLocalidades } from "../api/localidadesApi";
import { listarMunicipios } from "../api/municipiosApi";
import { localidadesKeys, municipiosKeys } from "./localidadesKeys";

export function useLocalidades(params?: {
  busqueda?: string;
  filtrarPor?: string;
  idMunicipio?: string;
  idNivelRiesgo?: number;
}) {
  return useQuery({
    queryKey: localidadesKeys.lista(params),
    queryFn: () => listarLocalidades(params),
  });
}

/** Municipios de una entidad, para el `<select>` en cascada Entidad -> Municipio. */
export function useMunicipiosDeEntidad(entidadId: string | null) {
  return useQuery({
    queryKey: municipiosKeys.lista(entidadId ? { entidadId } : undefined),
    queryFn: () => listarMunicipios(entidadId ? { entidadId } : undefined),
    enabled: entidadId !== null,
  });
}
