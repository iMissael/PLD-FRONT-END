import { useQuery } from "@tanstack/react-query";

import { listarTiposCredito } from "../api/tiposCreditoApi";
import { tiposCreditoKeys } from "./tiposCreditoKeys";

export function useTiposCredito() {
  return useQuery({
    queryKey: tiposCreditoKeys.lista(),
    queryFn: listarTiposCredito,
  });
}
