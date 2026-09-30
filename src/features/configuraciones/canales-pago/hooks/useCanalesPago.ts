import { useQuery } from "@tanstack/react-query";

import { listarCanalesPago } from "../api/canalesPagoApi";
import { canalesPagoKeys } from "./canalesPagoKeys";

export function useCanalesPago() {
  return useQuery({
    queryKey: canalesPagoKeys.lista(),
    queryFn: listarCanalesPago,
  });
}
