import { useQuery } from "@tanstack/react-query";

import { listarTiemposConstitucion } from "../api/tiemposConstitucionApi";
import { tiemposConstitucionKeys } from "./tiemposConstitucionKeys";

export function useTiemposConstitucion() {
  return useQuery({
    queryKey: tiemposConstitucionKeys.lista(),
    queryFn: listarTiemposConstitucion,
  });
}
