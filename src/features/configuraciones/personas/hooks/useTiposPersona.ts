import { useQuery } from "@tanstack/react-query";

import { listarTiposPersona } from "../api/tiposPersonaApi";
import { tiposPersonaKeys } from "./tiposPersonaKeys";

export function useTiposPersona() {
  return useQuery({
    queryKey: tiposPersonaKeys.lista(),
    queryFn: listarTiposPersona,
  });
}
