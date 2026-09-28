import { useQuery } from "@tanstack/react-query";

import { listarEdades } from "../api/edadesApi";
import { edadesKeys } from "./edadesKeys";

export function useEdades() {
  return useQuery({
    queryKey: edadesKeys.lista(),
    queryFn: listarEdades,
  });
}
