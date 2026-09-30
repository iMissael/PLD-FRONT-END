import { useQuery } from "@tanstack/react-query";

import { listarDestinosRecurso } from "../api/destinosRecursoApi";
import { destinosRecursoKeys } from "./destinosRecursoKeys";

export function useDestinosRecurso() {
  return useQuery({
    queryKey: destinosRecursoKeys.lista(),
    queryFn: listarDestinosRecurso,
  });
}
