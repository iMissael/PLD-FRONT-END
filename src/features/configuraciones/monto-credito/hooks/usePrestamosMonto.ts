import { useQuery } from "@tanstack/react-query";

import { listarPrestamosMonto } from "../api/prestamosMontoApi";
import { prestamosMontoKeys } from "./prestamosMontoKeys";

export function usePrestamosMonto() {
  return useQuery({
    queryKey: prestamosMontoKeys.lista(),
    queryFn: listarPrestamosMonto,
  });
}
