import { useQuery } from "@tanstack/react-query";

import {
  listarEntidadesDeZona,
  listarTodasLasEntidades,
  listarZonas,
} from "../api/zonasGeograficasApi";
import type { EstatusZona } from "../types/zonaGeografica";
import { zonasGeograficasKeys } from "./zonasGeograficasKeys";

export function useZonasGeograficas(estatus?: EstatusZona) {
  return useQuery({
    queryKey: zonasGeograficasKeys.lista(estatus),
    queryFn: () => listarZonas(estatus),
  });
}

/** Catálogo completo de zonas, usado como fuente de los `<select>` de otros features. */
export function useZonasGeograficasSelect() {
  return useQuery({
    queryKey: zonasGeograficasKeys.lista(),
    queryFn: () => listarZonas(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Entidades asignadas a una zona. Deshabilitado hasta que se pida explícitamente (botón "Ver"). */
export function useEntidadesDeZona(id: string, enabled: boolean) {
  return useQuery({
    queryKey: zonasGeograficasKeys.entidadesDeZona(id),
    queryFn: () => listarEntidadesDeZona(id),
    enabled,
  });
}

/** Todas las entidades del catálogo (para el picker de "asignar entidades a una zona"). */
export function useTodasLasEntidades() {
  return useQuery({
    queryKey: zonasGeograficasKeys.todasLasEntidades(),
    queryFn: listarTodasLasEntidades,
    staleTime: 60 * 1000,
  });
}
