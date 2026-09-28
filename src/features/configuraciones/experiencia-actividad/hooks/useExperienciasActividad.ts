import { useQuery } from "@tanstack/react-query";

import { listarExperienciasActividad } from "../api/experienciasActividadApi";
import { experienciasActividadKeys } from "./experienciasActividadKeys";

export function useExperienciasActividad() {
  return useQuery({
    queryKey: experienciasActividadKeys.lista(),
    queryFn: listarExperienciasActividad,
  });
}
