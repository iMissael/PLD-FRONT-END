import { useQuery } from "@tanstack/react-query";

import { listarOrigenesRecurso } from "../api/origenesRecursoApi";
import { origenesRecursoKeys } from "./origenesRecursoKeys";

export function useOrigenesRecurso() {
  return useQuery({
    queryKey: origenesRecursoKeys.lista(),
    queryFn: listarOrigenesRecurso,
  });
}
