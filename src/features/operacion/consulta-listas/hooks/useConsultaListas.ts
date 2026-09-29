import { useMutation, useQuery } from "@tanstack/react-query";
import {
  consultarListas,
  listarListasRestrictivas,
} from "@/features/operacion/consulta-listas/api/consultaListasApi";

export function useConsultarListas() {
  return useMutation({
    mutationFn: consultarListas,
  });
}

export function useListasRestrictivas() {
  return useQuery({
    queryKey: ["catalogos", "listas-restrictivas"],
    queryFn: listarListasRestrictivas,
    staleTime: Infinity,
  });
}
