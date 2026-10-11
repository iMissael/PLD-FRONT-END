import { useQuery } from "@tanstack/react-query";

import { listarPeps } from "../api/pepsApi";
import { pepsKeys } from "./pepsKeys";

export function usePeps() {
  return useQuery({
    queryKey: pepsKeys.lista(),
    queryFn: listarPeps,
  });
}
