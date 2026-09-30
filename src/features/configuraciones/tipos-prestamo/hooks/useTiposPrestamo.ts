import { useQuery } from "@tanstack/react-query";

import { listarTiposPrestamo } from "../api/tiposPrestamoApi";
import { tiposPrestamoKeys } from "./tiposPrestamoKeys";

export function useTiposPrestamo() {
  return useQuery({
    queryKey: tiposPrestamoKeys.lista(),
    queryFn: listarTiposPrestamo,
  });
}
