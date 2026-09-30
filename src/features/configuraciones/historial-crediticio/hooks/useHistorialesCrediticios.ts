import { useQuery } from "@tanstack/react-query";

import { listarHistorialesCrediticios } from "../api/historialesCrediticiosApi";
import { historialesCrediticiosKeys } from "./historialesCrediticiosKeys";

export function useHistorialesCrediticios() {
  return useQuery({
    queryKey: historialesCrediticiosKeys.lista(),
    queryFn: listarHistorialesCrediticios,
  });
}
