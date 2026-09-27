import { useQuery } from "@tanstack/react-query";

import { listarActividadesEconomicas } from "../api/actividadesEconomicasApi";
import { actividadesEconomicasKeys } from "./actividadesEconomicasKeys";

/**
 * Catálogo grande y estable: `staleTime` de 5 min para no volver a bajar las
 * ~1,261 filas cada vez que se entra a la pantalla.
 */
export function useActividadesEconomicas() {
  return useQuery({
    queryKey: actividadesEconomicasKeys.lista(),
    queryFn: listarActividadesEconomicas,
    staleTime: 5 * 60 * 1000,
  });
}
