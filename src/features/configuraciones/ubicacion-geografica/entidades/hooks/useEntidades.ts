import { useQuery } from "@tanstack/react-query";

import { listarEntidades } from "../api/entidadesApi";
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
